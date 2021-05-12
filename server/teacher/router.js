const passport = require('passport'),
    handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.get('/admin/teachers', passport.authenticate('basic'), handler.getTeachers);
    app.post('/admin/teachers', passport.authenticate('basic'), handler.registerClass);
});