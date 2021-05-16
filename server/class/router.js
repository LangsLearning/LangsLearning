const passport = require('passport'),
    handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.get('/admin/classes', passport.authenticate('basic'), handler.getClasses);
    app.post('/admin/classes', passport.authenticate('basic'), handler.registerClass);
    app.get('/admin/classes/:id/remove', passport.authenticate('basic'), handler.removeClass);
    app.post('/admin/classes/assign', passport.authenticate('basic'), handler.assignTeacher);

    app.get('/ops/classes/dump.json', passport.authenticate('basic'), handler.opsDumpAll);
    app.get('/ops/classes.json', passport.authenticate('basic'), handler.opsFindAll);
});