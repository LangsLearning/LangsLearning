const passport = require('passport');

module.exports = {
    apply: app => {
        const handler = require('./handler');

        app.get('/admin/teachers', passport.authenticate('basic'), handler.getTeachers);
        app.post('/admin/teachers', passport.authenticate('basic'), handler.registerClass);
    }
}