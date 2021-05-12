const logger = require('../logger'),
    mail = require('../contact/mail'),
    ejs = require('ejs'),
    path = require('path'),
    _ = require('lodash'),
    { serverConfig } = require('../config'),
    moment = require('moment'),
    Class = require('./class'),
    { Teacher } = require('../teacher'),
    Handler = require('../handler');


const getClasses = new Handler(async(req, res) => {
    const classes = await Class.find({});
    const teachers = await Teacher.find({ active: true });

    const classesWithTeacher = classes.map(async(aClass) => {
        const teacher = await teachers.find(teacher => aClass.teacherId == teacher._id);
        return { teacher, ...aClass };
    });

    logger.info(`Rendering admin classes page: ${classesWithTeacher.length} classes found, ${teachers.length} teachers available`);
    res.render('admin_classes', { classes, teachers, moment });

}).onErrorRender('admin_classes', err => ({ classes: [], teachers: [], error: err.message, moment }));

const registerClass = new Handler(async(req, res) => {
    const aClass = { title, description, level, datetime, materialLink, classLink } = req.body;
    if (!title || !description || !level || !datetime || !materialLink || !classLink) {
        logger.error(`Invalid class data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/classes');
        return;
    }

    const registered = await Class.register(aClass);
    logger.info(`Class ${JSON.stringify(registered)} registered`);
    res.redirect('/admin/classes');

}).onErrorRedirect('/admin/classes');

const removeClass = new Handler(async(req, res) => {
    const { id } = req.params;
    const _ = await Class.deactivateById(id);
    res.redirect('/admin/classes');

}).onErrorRedirect('/admin/classes');

const assignTeacher = new Handler(async(req, res) => {
    const { classId, teacherId } = req.body;
    if (!classId || !teacherId) {
        res.redirect('/admin/classes');
        return;
    }

    const _ = await Class.assignTeacher(classId, teacherId);
    res.redirect('/admin/classes');

}).onErrorRedirect('/admin/classes');

const opsDumpAll = new Handler(async(req, res) => {
    const _ = await Class.deleteMany({});
    res.status(200).json({ message: 'All classes deleted' });

}).onErrorReturnJson(500, err => ({ message: err }));

const opsFindAll = new Handler(async(req, res) => {
    const classes = await Class.find({});
    res.status(200).json(classes);

}).onErrorReturnJson(500, err => ({ message: err }));

module.exports = {
    getClasses,
    registerClass,
    removeClass,
    assignTeacher,
    opsDumpAll,
    opsFindAll,
};