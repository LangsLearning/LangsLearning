const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const getTeachers = repository => (req, res) => repository.findAllBy({})
    .then(teachers => {
        logger.info(`Rendering admin teachers page: ${teachers.length} teachers found`);
        res.render('admin_teachers', { teachers });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_teachers', { teachers: [], error: err.message });
    });

module.exports = () => {
    const repository = require('./repository');
    return {
        getTeachers: getTeachers(repository),
    }
};