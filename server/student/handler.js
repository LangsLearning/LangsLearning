const md5 = require('md5'),
    _ = require('lodash'),
    moment = require('moment'),
    logger = require('../logger'),
    Student = require('./student'),
    { Class } = require('../class'),
    { Teacher } = require('../teacher'),
    Handler = require('../handler');

const maxStudentsInAClass = 8;

const defaultTeacher = {
    name: 'Ainda nao definido',
    alias: 'Ainda nao definido',
    picture: '../images/unknown_teacher.png'
};

//TODO: REFACTOR
const homePage = new Handler(async(req, res) => {
    const student = req.session.student;
    student.classesIds = student.classesIds || [];

    const teachers = await Teacher.find({});
    const classes = await Class.findAllByIds(student.classesIds);

    student.nextClasses = [];
    student.pastClasses = [];

    //TODO: REFACTOR
    classes.forEach(aClass => {
        if (aClass.teacherId) {
            logger.info(`Trying to find teacher ${aClass.teacherId} inside ${JSON.stringify(teachers)}`);
            aClass.teacher = teachers.find(teacher => teacher._id == aClass.teacherId);
        }

        if (!aClass.teacher) {
            aClass.teacher = defaultTeacher;
        }

        if (moment().isAfter(aClass.datetime)) {
            student.pastClasses.push(aClass);
        } else {
            student.nextClasses.push(aClass);
        }
    });
    res.render('student_home', { student: req.session.student, moment });
    return student;

}).onErrorRedirect('/?error=home');

const studentAuthCheck = new Handler(async(req, res, next) => {
    const { student } = req.session;
    if (!student || !student._id) {
        logger.warn(`Student check: access denied, invalid session`);
        res.redirect('/');
        return;
    }

    const persistedStudent = await Student.findById(student._id);
    req.session.student = persistedStudent;
    next();

}).onErrorRedirect('/?error=student_check');

//TODO: REFACTOR
const login = new Handler(async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.redirect('/?login=error');
        return;
    }

    logger.info(`Student trying to login with email ${email}`);
    const student = await Student.findOne({ email });

    if (!student || student.password !== md5(password)) {
        throw 'Invalid credentials';
    }
    req.session.student = student;
    const doesntHaveNextClasses = !student.nextClasses || student.nextClasses.length === 0;
    const hasNoAvailableClasses = student.availableClasses === 0;
    if (doesntHaveNextClasses && hasNoAvailableClasses) {
        res.redirect('/student/packages');
    } else {
        res.redirect('/student/home');
    }

}).onErrorRedirect('/?login=error');

//TODO: REFACTOR
const bookAClassPage = new Handler(async(req, res) => {
    const { student } = req.session;
    const teachers = await Teacher.find({});
    const classes = await Class.findAllAvailableFor(student);
    const classesSortedByDatetime = _.sortBy(classes.map(aClass => {
        aClass.day = moment(aClass.datetime).format('DD/MM/yyyy');
        if (aClass.teacherId) {
            logger.info(`Trying to find teacher ${aClass.teacherId} inside ${JSON.stringify(teachers)}`);
            aClass.teacher = teachers.find(teacher => teacher._id == aClass.teacherId);
        }

        if (!aClass.teacher) {
            aClass.teacher = defaultTeacher;
        }

        return aClass;
    }), 'datetime');
    const classesByDay = _.groupBy(classesSortedByDatetime, 'day');
    res.render('student_bookclass', { student: req.session.student, classesByDay, moment });

}).onErrorRedirect('/?login=error');

const bookAClass = new Handler(async(req, res) => {
    const student = req.session.student;
    const { classId } = req.body;
    if (!student || !classId) {
        res.redirect('/student/bookaclass?booking=error');
        return;
    }

    const aClass = await Class.findById(classId);
    logger.info(`Class found: ${JSON.stringify(aClass)}`);
    if (aClass.students.length >= maxStudentsInAClass) {
        throw 'This class cannot accept more students!';
    }

    logger.info(`Adding student ${student._id} to class ${aClass._id}`);
    aClass.students.push(student._id);
    aClass.save();
    student.classesIds.push(aClass._id);
    student.availableClasses--;
    student.save();
    res.redirect('/student/bookaclass?booking=success');

}).onErrorRedirect('/student/bookaclass?booking=error');

const adminGetStudents = new Handler(async(req, res) => {
    const students = await Student.find({});
    res.render('admin_students', { students });

}).onErrorRedirect('/?error=adm_get_students');

const opsDumpAll = new Handler(async(req, res) => {
    const _ = await Student.deleteMany({});
    res.status(200).json({ message: 'All students deleted' });

}).onErrorRespondJson(500);

const opsDumpClasses = new Handler(async(req, res) => {
    const { id } = req.params;
    const _ = await Student.removeAllClassesOf(id);
    res.status(200).json({ message: `All classes of student ${id} deleted` })

}).onErrorRespondJson(500);

const opsFindAll = new Handler(async(req, res) => {
    const students = await Student.find({});
    res.status(200).json(students);

}).onErrorRespondJson(500);

module.exports = {
    homePage,
    studentAuthCheck,
    login,
    bookAClassPage,
    bookAClass,
    adminGetStudents,
    opsDumpAll,
    opsDumpClasses,
    opsFindAll,
};