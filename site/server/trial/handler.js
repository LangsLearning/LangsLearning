const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const uuid = require('uuid');
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');

const getRegisterTrialTemplate = (name, datetime, link) => {
    return ejs.renderFile(path.join(__dirname, '../mails/register-trial.html'), {
        name, datetime, link
    });
};

const getTrials = mongoClient => (req, res) => mongoClient.connect()
    .then(client => {
        logger.info(req);
        const db = client.db("langslearning");
        logger.info('Fetching trials in the database...');
        return db.collection('trials').find({ level: null }).toArray();
    })
    .then(trials => {
        logger.info(`${trials.length} trials found`)
        res.render('trials', { trials });
    })
    .catch(err => {
        logger.error(err);
        res.render('trials', { trials: [], error: err.message });
    });

const registerTrial = mongoClient => (req, res) => {
    const { name, email, datetime, link } = req.body;

    if (!name || !email || !datetime || !link) {
        logger.error('Invalid trial data to be registered');
        res.render('trials', { trials: [], error: 'Could not register the trial class' });
        return;
    }

    const trial = { id: uuid.v4(), name, email, datetime, link };

    mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            logger.info(`Registering trial ${trial} in the database...`);
            return db.collection('trials').insertOne(trial);
        })
        .then(result => {
            return getRegisterTrialTemplate(name, datetime, link);
        })
        .then(html => {
            return mail.sendHtml(email, 'LangsLearning - Aula Experimental', html);
        })
        .then(result => {
            res.redirect('/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/trials');
        });
};

const setLevel = mongoClient => (req, res) => {
    const { id, level } = req.body;

    if (!id || !level) {
        logger.error('Could not set student level, invalid id or level');
        res.render('trials', { trials: [], error: 'Could not set student level' });
        return;
    }

    mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            logger.info(`Updating level of student ${id} to ${level}`);
            return db.collection('trials').updateOne({ id }, { $set: { level } });
        })
        .then(result => {
            res.redirect('/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/trials');
        });
};

module.exports = mongoClient => ({
    getTrials: getTrials(mongoClient),
    registerTrial: registerTrial(mongoClient),
    setLevel: setLevel(mongoClient)
});