const logger = require('../logger'),
    Teacher = require('./teacher');

const getTeachers = (req, res) => Teacher.find({})
    .then(teachers => {
        logger.info(`Rendering admin teachers page: ${teachers.length} teachers found`);
        res.render('admin_teachers', { teachers });
    })
    .catch(err => {
        logger.error(err);
        res.render('admin_teachers', { teachers: [], error: err.message });
    });

const registerClass = (req, res) => {
    const teacher = { name, alias, email, description, picture } = req.body;
    if (!name || !alias || !email || !description || !picture) {
        logger.error(`Invalid teacher data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/teachers');
        return;
    }
    Teacher.register(teacher)
        .then(registered => {
            logger.info(`Teacher ${JSON.stringify(registered)} registered`);
            res.redirect('/admin/teachers');
        })
        .catch(err => {
            logger.error(err);
            res.redirect('/admin/teachers');
        });
};

module.exports = {
    getTeachers,
    registerClass,
};