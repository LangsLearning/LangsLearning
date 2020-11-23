const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://langslearning:q1w2e3@cluster0.zuiev.mongodb.net/<dbname>?retryWrites=true&w=majority";

const mongoClient = new MongoClient(uri);

mongoClient.connect()
 .then(client => {
     const db = client.db("langslearning");
     db.collection('users').find().toArray().then(users => console.log(users));
 })

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

const app = express();
app.use(bodyParser.json());
app.use(expressLogger);
app.use(cors());

const port = 3000;
const tokens = {};

app.get('/contact', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const token = `contact-${uuid.v4()}`;
    tokens[token] = clientIp;
    res.status(200).json({ token });
});

app.post('/contact', (req, res) => {
    const { email, text, token } = req.body;
    console.log(req.body);
    if (!email || !text || !token || tokens[token] == undefined) {
        logger.info("Invalid contact data");
        res.status(400).json({ message: 'Invalid contact data' });
    } else {
        delete tokens[token];
        const content = `
            Contact from: ${email}.
            Message: ${text}
        `;
        sendEmailTo('support@langslearning.com', 'Visitant Contact', content).then((info, err) => {
            if (err) {
                logger.error(err);
                res.status(500).json({message: 'Error sending the e-mail'});
            } else {
                logger.info(`Contact e-mail from ${email} sent successfully`);
                res.status(200).json({message: 'E-mail sent!'});
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

const transport = nodemailer.createTransport({
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 587,
    auth: {
        user: 'AKIA4VPONNPUNNKGKELG',
        pass: 'BP/7nE8AzXx4Iq3XCK/k690gXbbZq6R+7prUp7iHFTza'
    }
});

const sendEmailTo = (email, subject, content) => {
    const message = {
        from: 'support@langslearning.com', // Sender address
        to: email,         // List of recipients
        subject: subject, // Subject line
        text: content // Plain text body
    };
    return transport.sendMail(message);
};