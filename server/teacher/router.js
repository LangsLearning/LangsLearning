const passport = require('passport'),
    handler = require('./handler');

module.exports = {
    apply: app => {
        app.get('/admin/teachers', passport.authenticate('basic'), handler.getTeachers);
        app.post('/admin/teachers', passport.authenticate('basic'), handler.registerClass);
    }
}