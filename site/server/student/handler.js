const pino = require("pino");
const repository = require("./repository");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const md5 = require('md5');

const studentAuthCheck = repository => (req, res, next) => {
    const { student } = req.session;
    if (!student || !student.id) {
        logger.warn(`Student check: access denied, invalid session`);
        res.redirect('/');
        return;
    }

    repository.findById(student.id)
        .then(persistedStudent => {
            req.session.student = persistedStudent;
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

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    return {
        studentAuthCheck: studentAuthCheck(repository),
        login: login(repository),
    }
};