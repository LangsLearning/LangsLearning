const express = require('express');
const bodyParser = require('body-parser');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://langslearning:q1w2e3@cluster0.zuiev.mongodb.net/langslearning?retryWrites=true&w=majority";

const mail = require('./contact/mail');

const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
//app.use(expressLogger);
app.use(cors());

const port = 3000;
const contactRouter = require('./contact/router');
const staticRouter = require('./static/router');
const authRouter = require('./auth/router');
const trialRouter = require('./trial/router');

contactRouter.apply(app);
staticRouter.apply(app);
authRouter.apply(mongoClient, app);
trialRouter.apply(mongoClient, app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

