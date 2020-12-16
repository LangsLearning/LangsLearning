const pino = require("pino");
const repository = require("./repository");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const md5 = require('md5');

const studentAuthCheck = repository => (req, res, next) => {
    const { studentId } = req.session;
    if (!studentId) {
        logger.warn(`Student check: access denied, invalid session`);
        res.redirect('/');
        return;
    }

    repository.findById(studentId)
        .then(student => {
            req.session.student = student;
            next();
        })
        .catch(err => {
            logger.warn(`Student check: access denied, invalid session data`);
            res.redirect('/');
        });
};

const login = repository => (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.redirect('/?login=error');
        return;
    }
    repository.findByEmail(email)
        .then(student => {
            if (!student) {
                return Promise.reject('Invalid e-mail');
            }

            if (student.password === md5(password)) {
                return Promise.resolve(student);
            }

            return Promise.reject('Invalid password');
        })
        .then(student => {
            req.session.studentId = student.id;
            req.session.student = student;
            res.redirect('/student/home');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/?login=error');
        });
};

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    return {
        studentAuthCheck: studentAuthCheck(repository),
        login: login(repository),
    }
};