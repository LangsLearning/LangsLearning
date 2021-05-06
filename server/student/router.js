const passport = require('passport');
const moment = require('moment');

module.exports = {
    apply: app => {
        const repository = require('./repository');
        const handler = require('./handler')();

        app.post('/student/classes/book', handler.studentAuthCheck, handler.bookAClass);

        app.get('/student/bookaclass', handler.studentAuthCheck, handler.bookAClassPage);
        app.get('/student/packages', handler.studentAuthCheck, (req, res) => {
            res.render('student_packages', { student: req.session.student });
        });
        app.get('/student/home', handler.studentAuthCheck, handler.homePage);

        app.post('/student/login', handler.login);

        app.get('/admin/students', passport.authenticate('basic'), handler.adminGetStudents);

        app.get('/ops/students/dump.json', passport.authenticate('basic'), handler.opsDumpAll);
        app.get('/ops/students/:id/classes/dump.json', passport.authenticate('basic'), handler.opsDumpClasses);
        app.get('/ops/students.json', passport.authenticate('basic'), handler.opsFindAll);
    }
};