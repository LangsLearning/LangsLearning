const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');
const repository = require("./repository");
const { serverConfig } = require('../config');

const getClasses = classesRepository => (req, res) => classesRepository.findAll()
    .then(classes => {
        logger.info(`Rendering admin classes page: ${classes.length} classes found`);
        res.render('admin_classes', { classes });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_classes', { classes: [], error: err.message });
    });

const registerClass = classesRepository => (req, res) => {
    const newClass = { title, description, level, datetime, materialLink, classLink } = req.body;
    if (!title || !description || !level || !datetime || !materialLink || !classLink) {
        logger.error(`Invalid class data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/classes');
        return;
    }

    classesRepository.register(newClass)
        .then(registered => {
            logger.info(`Class ${JSON.stringify(registered)} registered`);
            res.redirect('/admin/classes');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/classes');
        });
};

const removeClass = classesRepository => (req, res) => {
    const { id } = req.params;
    classesRepository.remove(id)
        .then(result => {
            res.redirect('/admin/classes');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/classes');
        });
};

module.exports = () => {
    const repository = require('./repository');
    return {
        getClasses: getClasses(repository),
        registerClass: registerClass(repository),
        removeClass: removeClass(repository),
    }
};