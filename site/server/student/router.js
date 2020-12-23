const passport = require('passport');

module.exports = {
    apply: app => {
        const repository = require('./repository');
        const handler = require('./handler')();

        app.get('/student/bookaclass', handler.studentAuthCheck, handler.bookAClass);
        app.get('/student/packages', handler.studentAuthCheck, (req, res) => {
            res.render('student_packages', { student: req.session.student });
        });
        app.get('/student/home', handler.studentAuthCheck, (req, res) => {
            res.render('student_home', { student: req.session.student });
        });

        app.post('/student/login', handler.login);

        app.get('/ops/students/dump.json', passport.authenticate('basic'), handler.opsDumpAll);
        app.get('/ops/students.json', passport.authenticate('basic'), handler.opsFindAll);
    }
};