const logger = require('../logger'),
    mail = require('../contact/mail'),
    ejs = require('ejs'),
    path = require('path'),
    { serverConfig } = require('../config'),
    Student = require('../student/student'),
    tokens = require('../token/tokens'),
    Trial = require('./trial');

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

const getTrials = (req, res) =>
    Trial.find({ level: null })
    .then(trials => {
        logger.info(`Rendering trials page: ${trials.length} trials found`);
        res.render('admin_trials', { trials });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_trials', { trials: [], students: [], error: err.message });
    });

const registerTrial = (req, res) => {
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
        .then(result => Trial.register({ name, email, datetime, link }))
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

const setLevel = (req, res) => {
    const { id, level } = req.body;

    if (!id || !level) {
        logger.error('Could not set student level, invalid id or level');
        res.render('admin_trials', { trials: [], students: [], error: 'Could not set student level' });
        return;
    }

    Trial.setLevel(id, level)
        .then(result => Trial.findById(id))
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

const removeTrial = (req, res) => {
    const { id } = req.params;
    Trial.deleteOne({ _id: id })
        .then(result => {
            res.redirect('/admin/trials');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/trials');
        });
};

const opsDumpAll = (req, res) => {
    Trial.deleteMany({})
        .then(result => res.status(200).json({ message: 'All trials deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = (req, res) => {
    Trial.find({})
        .then(trials => res.status(200).json(trials))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = {
    getTrials,
    registerTrial,
    setLevel,
    removeTrial,
    opsDumpAll,
    opsFindAll,
};