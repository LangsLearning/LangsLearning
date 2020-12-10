const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const uuid = require('uuid');
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');
const repository = require("./repository");

const getRegisterTrialTemplate = (name, datetime, link) => {
    return ejs.renderFile(path.join(__dirname, '../mails/register-trial.html'), {
        name, datetime, link
    });
};

const getSetPasswordTemplate = (id, name, level, token) => {
    return ejs.renderFile(path.join(__dirname, '../mails/student-set-password.html'), {
        id, name, level, token
    });
};

const getTrials = repository => (req, res) => repository.findAll()
    .then(trials => {
        logger.info(`${trials.length} trials found`)
        res.render('trials', { trials });
    })
    .catch(err => {
        logger.error(err);
        res.render('trials', { trials: [], error: err.message });
    });

const registerTrial = repository => (req, res) => {
    const { name, email, datetime, link } = req.body;

    if (!name || !email || !datetime || !link) {
        logger.error('Invalid trial data to be registered');
        res.render('trials', { trials: [], error: 'Could not register the trial class' });
        return;
    }

    repository.register({ name, email, datetime, link })
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

const setLevel = (tokens, repository) => (req, res) => {
    const { id, level } = req.body;

    if (!id || !level) {
        logger.error('Could not set student level, invalid id or level');
        res.render('trials', { trials: [], error: 'Could not set student level' });
        return;
    }

    repository.setLevel(id, level)
        .then(result => repository.findById(id))
        .then(trial => tokens.createSignInToken(trial.id, trial.email).then(token => [trial, token]))
        .then(data => {
            const [trial, token] = data;
            return getSetPasswordTemplate(trial.id, trial.name, trial.level, token.id).then(html => [trial.email, html]);
        })
        .then(data => {
            const [email, html] = data;
            logger.info(`Sending signin e-mail to user ${email} with content ${html}`);
            return mail.sendHtml(email, 'LangsLearning - Bem vindo a Langs Learning!', html);
        })
        .then(result => {
            res.redirect('/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/trials');
        });
};

const removeTrial = repository => (req, res) => {
    const { id } = req.params;
    repository.remove(id)
        .then(result => {
            res.redirect('/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/trials');
        });
};

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    const tokens = require('../token/tokens')(mongoClient);
    return {
        getTrials: getTrials(repository),
        registerTrial: registerTrial(repository),
        setLevel: setLevel(tokens, repository),
        removeTrial: removeTrial(repository)
    }
};