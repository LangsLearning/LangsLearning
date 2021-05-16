const mail = require('./mail'),
    uuid = require('uuid'),
    logger = require('../logger'),
    Handler = require('../handler');

//TODO: needs to be inside the DB when running more than one instance
const tokens = {};

const getContactToken = new Handler((req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const token = `contact-${uuid.v4()}`;
    tokens[token] = clientIp;
    res.status(200).json({ token });

}).onErrorRespondJson(500);

//TODO: REFACTOR
const sendContact = new Handler(async(req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { email, text, token } = req.body;
    if (!email || !text || !token || tokens[token] != clientIp) {
        logger.info("Invalid contact data");
        res.status(400).json({ message: 'Invalid contact data' });
        return;
    }

    delete tokens[token];
    const content = `
            Contact from: ${email}.
            Message: ${text}
        `;

    const _ = await mail.sendToSupport('Visitant Contact', content);
    logger.info(`Contact e-mail from ${email} sent successfully`);
    res.status(200).json({ message: 'E-mail sent!' });

}).onErrorReturnJson(500, err => ({ message: 'Error sending the e-mail' }));

const requestTrial = new Handler((req, res) => {
    const { email } = req.body;
    mail.sendToTeachers('Trial class', `There is a new user requesting trial class. Email: ${email}`);
    res.redirect('/?trial_class=success');

}).onErrorRespondJson(500);

module.exports = {
    getContactToken,
    sendContact,
    requestTrial
};