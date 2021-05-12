const logger = require('../logger'),
    mail = require('../contact/mail'),
    ejs = require('ejs'),
    path = require('path'),
    { serverConfig } = require('../config'),
    moment = require('moment'),
    Class = require('./class'),
    Teacher = require('../teacher/teacher');

const getClasses = (req, res) => Class.find({})
    .then(classes =>
        Teacher.find({ active: true }).map(teachers => ({ classes, teachers }))
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

const registerClass = (req, res) => {
    const newClass = { title, description, level, datetime, materialLink, classLink } = req.body;
    if (!title || !description || !level || !datetime || !materialLink || !classLink) {
        logger.error(`Invalid class data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/classes');
        return;
    }

    Class.register(newClass)
        .then(registered => {
            logger.info(`Class ${JSON.stringify(registered)} registered`);
            res.redirect('/admin/classes');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/classes');
        });
};

const removeClass = (req, res) => {
    const { id } = req.params;
    Class.deactivateById(id)
        .then(result => {
            res.redirect('/admin/classes');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/classes');
        });
};

const assignTeacher = (req, res) => {
    const { classId, teacherId } = req.body;
    if (!classId || !teacherId) {
        res.redirect('/admin/classes');
        return;
    }

    Class.assignTeacher(classId, teacherId)
        .then(result => {
            res.redirect('/admin/classes');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/classes');
        });
};

const opsDumpAll = (req, res) => {
    Class.deleteMany({})
        .then(result => res.status(200).json({ message: 'All classes deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = (req, res) => {
    Class.find({})
        .then(trials => res.status(200).json(trials))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = {
    getClasses,
    registerClass,
    removeClass,
    assignTeacher,
    opsDumpAll,
    opsFindAll,
};