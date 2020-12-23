const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');
const repository = require("./repository");
const { serverConfig } = require('../config');
const moment = require('moment');

const getClasses = classesRepository => (req, res) => classesRepository.findAllBy({})
    .then(classes => {
        logger.info(`Rendering admin classes page: ${classes.length} classes found`);
        res.render('admin_classes', { classes, moment });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_classes', { classes: [], error: err.message, moment });
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

const opsDumpAll = repository => (req, res) => {
    repository.removeAllBy({})
        .then(result => res.status(200).json({ message: 'All classes deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = repository => (req, res) => {
    repository.findAllBy({})
        .then(trials => res.status(200).json(trials))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = () => {
    const repository = require('./repository');
    return {
        getClasses: getClasses(repository),
        registerClass: registerClass(repository),
        removeClass: removeClass(repository),
        opsDumpAll: opsDumpAll(repository),
        opsFindAll: opsFindAll(repository),
    }
};