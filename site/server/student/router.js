const passport = require('passport');

module.exports = {
    apply: (mongoClient, app) => {
        const repository = require('./repository')(mongoClient);
        const { studentAuthCheck } = require('./handler')(mongoClient);

        app.get('/student/bookaclass', studentAuthCheck, (req, res) => {
            res.render('student_bookclass', { student: req.session.student });
        });
        app.get('/student/packages', studentAuthCheck, (req, res) => {
            res.render('student_packages', { student: req.session.student });
        });
        app.get('/student/home', studentAuthCheck, (req, res) => {
            res.render('student_home', { student: req.session.student });
        });
        app.get('/ops/students/dump.json', passport.authenticate('basic'), (req, res) => {
            repository.deleteBy({})
                .then(result => res.status(200).json({ message: 'All students deleted' }))
                .catch(err => res.status(500).json({ message: err }));
        });
        app.get('/ops/students.json', passport.authenticate('basic'), (req, res) => {
            repository.findAllBy({})
                .then(students => res.status(200).json(students))
                .catch(err => res.status(500).json({ message: err }));
        });
    }
};