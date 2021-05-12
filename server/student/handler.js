const md5 = require('md5'),
    _ = require('lodash'),
    moment = require('moment'),
    Class = require('../class/class'),
    Student = require('./student'),
    logger = require('../logger');

const maxStudentsInAClass = 8;

const defaultTeacher = {
    name: 'Ainda nao definido',
    alias: 'Ainda nao definido',
    picture: '../images/unknown_teacher.png'
};

const homePage = (teachersRepository) => (req, res) => {
    const student = req.session.student;
    student.classesIds = student.classesIds || [];

    teachersRepository.findAllBy({})
        .then(teachers =>
            Class.findAllByIds(student.classesIds).then(classes => ({ teachers, classes }))
        )
        .then(data => {
            const { teachers, classes } = data;
            student.nextClasses = [];
            student.pastClasses = [];
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
        });
};

const studentAuthCheck = (req, res, next) => {
    const { student } = req.session;
    if (!student || !student._id) {
        logger.warn(`Student check: access denied, invalid session`);
        res.redirect('/');
        return;
    }

    Student.findById(student._id)
        .then(persistedStudent => {
            req.session.student = persistedStudent;
            next();
        })
        .catch(err => {
            logger.warn(`Student check: access denied, invalid session data`);
            res.redirect('/');
        });
};

const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.redirect('/?login=error');
        return;
    }

    logger.info(`Student trying to login with email ${email}`);
    Student.findOne({ email })
        .then(student => {
            if (!student) {
                return Promise.reject('Invalid e-mail');
            }

            if (student.password === md5(password)) {
                logger.info(`Student ${email} found and password matched`)
                return Promise.resolve(student);
            }

            return Promise.reject('Invalid password');
        })
        .then(student => {
            req.session.student = student;
            const doesntHaveNextClasses = !student.nextClasses || student.nextClasses.length === 0;
            const hasNoAvailableClasses = student.availableClasses === 0;
            if (doesntHaveNextClasses && hasNoAvailableClasses) {
                res.redirect('/student/packages');
            } else {
                res.redirect('/student/home');
            }
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/?login=error');
        });
};

const bookAClassPage = (teachersRepository) => (req, res) => {
    const { student } = req.session;
    teachersRepository.findAllBy({})
        .then(teachers =>
            Class.findAllAvailableFor(student).then(classes => ({ teachers, classes }))
        )
        .then(data => {
            const { teachers, classes } = data;
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
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/?login=error');
        });
};

const bookAClass = (req, res) => {
    const student = req.session.student;
    const { classId } = req.body;
    if (!student || !classId) {
        res.redirect('/student/bookaclass?booking=error');
        return;
    }

    Class.findById(classId)
        .then(aClass => {
            logger.info(`Class found: ${JSON.stringify(aClass)}`);
            if (aClass.students.length < maxStudentsInAClass) {
                logger.info(`Adding student ${student._id} to class ${aClass._id}`);
                aClass.students.push(student._id);
                return aClass.save();
            } else {
                return Promise.reject('This class cannot accept more students!');
            }
        })
        .then(aClass => {
            student.classesIds.push(aClass._id);
            student.availableClasses--;
            student.save();
        })
        .then(_ => {
            res.redirect('/student/bookaclass?booking=success');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/student/bookaclass?booking=error');
        });
};

const adminGetStudents = (req, res) => {
    Student.find({})
        .then(students => {
            res.render('admin_students', { students });
        })
};

const opsDumpAll = (req, res) => {
    Student.deleteMany({})
        .then(result => res.status(200).json({ message: 'All students deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsDumpClasses = (req, res) => {
    const { id } = req.params;
    Student.removeAllClassesOf(id)
        .then(result => res.status(200).json({ message: `All classes of student ${id} deleted` }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = (req, res) => {
    Student.find({})
        .then(students => res.status(200).json(students))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = () => {
    const teachersRepository = require('../teacher/repository');

    return {
        homePage: homePage(teachersRepository),
        studentAuthCheck,
        login,
        bookAClassPage: bookAClassPage(teachersRepository),
        bookAClass,
        adminGetStudents,
        opsDumpAll,
        opsDumpClasses,
        opsFindAll,
    }
};