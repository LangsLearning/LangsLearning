const passport = require('passport');

module.exports = {
    apply: app => {
        const handler = require('./handler')();

        app.get('/admin/classes', passport.authenticate('basic'), handler.getClasses);
        app.post('/admin/classes', passport.authenticate('basic'), handler.registerClass);
        app.get('/admin/classes/:id/remove', passport.authenticate('basic'), handler.removeClass);
    }
}