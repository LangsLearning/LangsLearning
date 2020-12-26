const passport = require('passport');
const moment = require('moment');

module.exports = {
    apply: app => {
        const repository = require('./repository');
        const classesRepository = require('../classes/repository');
        const handler = require('./handler')();

        app.get('/student/bookaclass', handler.studentAuthCheck, handler.bookAClass);
        app.get('/student/packages', handler.studentAuthCheck, (req, res) => {
            res.render('student_packages', { student: req.session.student });
        });
        app.get('/student/home', handler.studentAuthCheck, (req, res) => {
            const student = req.session.student;
            student.classesIds = student.classesIds || [];
            classesRepository.findAllByIds(student.classesIds).then(classes => {
                student.nextClasses = [];
                student.pastClasses = [];
                classes.forEach(aClass => {
                    if (moment().isAfter(aClass.datetime)) {
                        student.pastClasses.push(aClass);
                    } else {
                        student.nextClasses.push(aClass);
                    }
                })

                student.nextClasses = [].filter(aClass => moment().isAfter(aClass.datetime));
                res.render('student_home', { student: req.session.student });
            });
        });

        app.post('/student/login', handler.login);

        app.get('/ops/students/dump.json', passport.authenticate('basic'), handler.opsDumpAll);
        app.get('/ops/students.json', passport.authenticate('basic'), handler.opsFindAll);
    }
};