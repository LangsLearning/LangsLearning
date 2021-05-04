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

const registerClass = repository => (req, res) => {
    const teacher = { name, alias, email, description, picture } = req.body;
    if (!name || !alias || !email || !description || !picture) {
        logger.error(`Invalid teacher data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/teachers');
        return;
    }
    repository.register(teacher)
        .then(registered => {
            logger.info(`Teacher ${JSON.stringify(registered)} registered`);
            res.redirect('/admin/teachers');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/teachers');
        });
};

module.exports = () => {
    const repository = require('./repository');
    return {
        getTeachers: getTeachers(repository),
        registerClass: registerClass(repository),
    }
};