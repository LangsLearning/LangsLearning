const logger = require('../logger'),
    Teacher = require('./teacher'),
    Handler = require('../handler');

const getTeachers = new Handler(async(req, res) => {
    const teachers = await Teacher.find({});
    logger.info(`Rendering admin teachers page: ${teachers.length} teachers found`);
    res.render('admin_teachers', { teachers });

}).onErrorRender('admin_teachers', err => ({ teachers: [], error: err.message }));

const registerClass = new Handler(async(req, res) => {
    const teacher = { name, alias, email, description, picture } = req.body;
    if (!name || !alias || !email || !description || !picture) {
        logger.error(`Invalid teacher data to be registered, ${JSON.stringify(req.body)}`);
        res.redirect('/admin/teachers');
        return;
    }

    const registered = await Teacher.register(teacher);
    logger.info(`Teacher ${JSON.stringify(registered)} registered`);
    res.redirect('/admin/teachers');

}).onErrorRedirect('/admin/teachers');

module.exports = {
    getTeachers,
    registerClass,
};