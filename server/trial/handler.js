const logger = require('../logger'),
    mail = require('../contact/mail'),
    ejs = require('ejs'),
    path = require('path'),
    { serverConfig } = require('../config'),
    { Student } = require('../student'),
    { Token } = require('../token'),
    Trial = require('./trial'),
    Handler = require('../handler');

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

const getTrials = new Handler(async(req, res) => {
    const trials = await Trial.find({ level: null });
    logger.info(`Rendering trials page: ${trials.length} trials found`);
    res.render('admin_trials', { trials });

}).onErrorRedirect('admin_trials', err => ({ trials: [], students: [], error: err.message }));

const registerTrial = new Handler(async(req, res) => {
    const { name, email, datetime, link } = req.body;

    if (!name || !email || !datetime || !link) {
        logger.error(`Invalid trial data to be registered, ${JSON.stringify(req.body)}`);
        res.render('admin_trials', { trials: [], students: [], error: 'Could not register the trial class' });
        return;
    }

    const student = await Student.findOne({ email });
    if (student) {
        res.redirect('/admin/trials?error=existent_student');
        return;
    }

    const trialRegistered = await Trial.register({ name, email, datetime, link });
    const html = await getRegisterTrialTemplate(name, datetime, link);
    logger.info(`Sending trial e-mail to user ${email} with content ${html}`);
    const mailSent = await mail.sendHtml(email, 'LangsLearning - Aula Experimental', html);
    res.redirect('/admin/trials');

}).onErrorRedirect('/admin/trials?error=trial');

const setLevel = new Handler(async(req, res) => {
    const { id, level } = req.body;

    if (!id || !level) {
        logger.error('Could not set student level, invalid id or level');
        res.render('admin_trials', { trials: [], students: [], error: 'Could not set student level' });
        return;
    }

    const levelSet = await Trial.setLevel(id, level);
    const trial = await Trial.findById(id);
    const token = await Token.createSignInToken(trial._id, trial.email);
    const html = await getSetPasswordTemplate(trial._id, trial.name, trial.level, token._id);
    logger.info(`Sending signin e-mail to user ${email} with content ${html}`);
    const emailSent = await mail.sendHtml(email, 'LangsLearning - Bem vindo a Langs Learning!', html);
    res.redirect('/admin/trials');

}).onErrorRedirect('/admin/trials');

const removeTrial = new Handler(async(req, res) => {
    const { id } = req.params;
    const _ = await Trial.deleteOne({ _id: id });
    res.redirect('/admin/trials');

}).onErrorRedirect('/admin/trials');

const opsDumpAll = new Handler(async(req, res) => {
    const _ = await Trial.deleteMany({});
    res.status(200).json({ message: 'All trials deleted' });

}).onErrorRespondJson(500);

const opsFindAll = new Handler(async(req, res) => {
    const trials = await Trial.find({});
    res.status(200).json(trials);

}).onErrorRespondJson(500);

module.exports = {
    getTrials,
    registerTrial,
    setLevel,
    removeTrial,
    opsDumpAll,
    opsFindAll,
};