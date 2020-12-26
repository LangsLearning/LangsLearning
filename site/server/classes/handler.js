const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');
const repository = require("./repository");
const { serverConfig } = require('../config');
const moment = require('moment');

const getClasses = (classesRepository, teachersRepository) => (req, res) => classesRepository.findAllBy({})
    .then(classes =>
        teachersRepository.findAllBy({ active: true }).map(teachers => ({ classes, teachers }))
    )
    .then(data => {
        const { classes, teachers } = data;
        const updatedClasses = classes.map(aClass => {
            aClass.teacher = teachers.find(teacher => aClass.teacherId == teacher._id);
            return aClass;
        });
        return { classes: updatedClasses, teachers };
    })
    .then(data => {
        const { classes, teachers } = data;
        logger.info(`Rendering admin classes page: ${classes.length} classes found, ${teachers.length} teachers available`);
        res.render('admin_classes', { classes, teachers, moment });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_classes', { classes: [], teachers: [], error: err.message, moment });
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

const assignTeacher = classesRepository => (req, res) => {
    const { classId, teacherId } = req.body;
    if (!classId || !teacherId) {
        res.redirect('/admin/classes');
        return;
    }

    classesRepository.assignTeacher(classId, teacherId)
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
    const classesRepository = require('./repository');
    const teachersRepository = require('../teacher/repository');
    return {
        getClasses: getClasses(classesRepository, teachersRepository),
        registerClass: registerClass(classesRepository),
        removeClass: removeClass(classesRepository),
        assignTeacher: assignTeacher(classesRepository),
        opsDumpAll: opsDumpAll(classesRepository),
        opsFindAll: opsFindAll(classesRepository),
    }
};