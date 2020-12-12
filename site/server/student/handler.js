const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

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

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    return {
        studentAuthCheck: studentAuthCheck(repository)
    }
};