const mail = require('./mail');
const uuid = require('uuid');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const tokens = {};

const getContactToken = (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const token = `contact-${uuid.v4()}`;
    tokens[token] = clientIp;
    res.status(200).json({ token });
};

const sendContact = (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { email, text, token } = req.body;
    if (!email || !text || !token || tokens[token] != clientIp) {
        logger.info("Invalid contact data");
        res.status(400).json({ message: 'Invalid contact data' });
    } else {
        delete tokens[token];
        const content = `
            Contact from: ${email}.
            Message: ${text}
        `;
        mail.sendToSupport('Visitant Contact', content).then((info, err) => {
            if (err) {
                logger.error(err);
                res.status(500).json({message: 'Error sending the e-mail'});
            } else {
                logger.info(`Contact e-mail from ${email} sent successfully`);
                res.status(200).json({message: 'E-mail sent!'});
            }
        });
    }
};

const requestTrial = (req, res) => {
    const {email} = req.body;
    mail.sendToTeachers('Trial class', `There is a new user requesting trial class. Email: ${email}`);
    res.redirect('/?trial_class=success');
};

module.exports = {
    getContactToken,
    sendContact,
    requestTrial
};