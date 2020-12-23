const pino = require("pino");
const repository = require("./repository");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const md5 = require('md5');

const studentAuthCheck = repository => (req, res, next) => {
    const { student } = req.session;
    if (!student || !student._id) {
        logger.warn(`Student check: access denied, invalid session`);
        res.redirect('/');
        return;
    }

    repository.findById(student._id)
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

    logger.info(`Student trying to login with email ${email}`);
    repository.findByEmail(email)
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

const bookAClass = classesRepository => (req, res) => {
    const { id } = req.session.student;
    classesRepository.findAllAvailableFor(id)
        .then(classes => {
            res.render('student_bookclass', { student: req.session.student, classes });
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/?login=error');
        });
};

const opsDumpAll = repository => (req, res) => {
    repository.removeAllBy({})
        .then(result => res.status(200).json({ message: 'All students deleted' }))
        .catch(err => res.status(500).json({ message: err }));
};

const opsFindAll = repository => (req, res) => {
    repository.findAllBy({})
        .then(students => res.status(200).json(students))
        .catch(err => res.status(500).json({ message: err }));
};

module.exports = () => {
    const repository = require('./repository');
    const classesRepository = require('../classes/repository');

    return {
        studentAuthCheck: studentAuthCheck(repository),
        login: login(repository),
        bookAClass: bookAClass(classesRepository),
        opsDumpAll: opsDumpAll(repository),
        opsFindAll: opsFindAll(repository),
    }
};