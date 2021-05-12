const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');
const repository = require("./repository");
const { serverConfig } = require('../config');
const Student = require('../student/student');

const getRegisterTrialTemplate = (name, datetime, link) => {
    return ejs.renderFile(path.join(__dirname, '../mails/register-trial.html'), {
        name,
        datetime,
        link
    });
};

const getSetPasswordTemplate = (id, name, level, token) => {
    const link = `${serverConfig.url}/signin/${token}`;
    return ejs.renderFile(path.join(__dirname, '../mails/student-set-password.html'), {
        id,
        name,
        level,
        link
    });
};

const getTrials = (trialsRepository) => (req, res) =>
    trialsRepository
    .findAllBy({ level: null })
    .then(trials => {
        logger.info(`Rendering trials page: ${trials.length} trials found`);
        res.render('admin_trials', { trials });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_trials', { trials: [], students: [], error: err.message });
    });

const registerTrial = (trialRepository) => (req, res) => {
    const { name, email, datetime, link } = req.body;

    if (!name || !email || !datetime || !link) {
        logger.error(`Invalid trial data to be registered, ${JSON.stringify(req.body)}`);
        res.render('admin_trials', { trials: [], students: [], error: 'Could not register the trial class' });
        return;
    }

    Student.findOne({ email })
        .then(student => {
            if (student) {
                return Promise.reject({ message: 'There is already a Student registered', type: 'existent_student' });
            } else {
                return Promise.resolve({});
            }
        })
        .then(result => trialRepository.register({ name, email, datetime, link }))
        .then(result => {
            return getRegisterTrialTemplate(name, datetime, link);
        })
        .then(html => {
            logger.info(`Sending trial e-mail to user ${email} with content ${html}`);
            return mail.sendHtml(email, 'LangsLearning - Aula Experimental', html);
        })
        .then(result => {
            res.redirect('/admin/trials');
        })
        .catch(err => {
            logger.error(err.message || err);
            res.redirect(`/admin/trials?error=${err.type || err}`);
        });
};

const setLevel = (tokens, repository) => (req, res) => {
    const { id, level } = req.body;

    if (!id || !level) {
        logger.error('Could not set student level, invalid id or level');
        res.render('admin_trials', { trials: [], students: [], error: 'Could not set student level' });
        return;
    }

    repository.setLevel(id, level)
        .then(result => repository.findById(id))
        .then(trial => tokens.createSignInToken(trial._id, trial.email).then(token => [trial, token]))
        .then(data => {
            const [trial, token] = data;
            return getSetPasswordTemplate(trial._id, trial.name, trial.level, token._id).then(html => [trial.email, html]);
        })
        .then(data => {
            const [email, html] = data;
            logger.info(`Sending signin e-mail to user ${email} with content ${html}`);
            return mail.sendHtml(email, 'LangsLearning - Bem vindo a Langs Learning!', html);
        })
        .then(result => {
            res.redirect('/admin/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/trials');
        });
};

const removeTrial = repository => (req, res) => {
    const { id } = req.params;
    repository.remove(id)
        .then(result => {
            res.redirect('/admin/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/trials');
        });
};

const opsDumpAll = repository => (req, res) => {
    repository.removeAllBy({})
        .then(result => res.status(200).json({ message: 'All trials deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = repository => (req, res) => {
    repository.findAllBy({})
        .then(trials => res.status(200).json(trials))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = () => {
    const repository = require('./repository');
    const tokens = require('../token/tokens');
    return {
        getTrials: getTrials(repository),
        registerTrial: registerTrial(repository),
        setLevel: setLevel(tokens, repository),
        removeTrial: removeTrial(repository),
        opsDumpAll: opsDumpAll(repository),
        opsFindAll: opsFindAll(repository),
    }
};