const passport = require('passport'),
    handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.get('/admin/trials', passport.authenticate('basic'), handler.getTrials);
    app.post('/admin/trials', passport.authenticate('basic'), handler.registerTrial);
    app.post('/admin/trials/level', passport.authenticate('basic'), handler.setLevel);
    app.get('/admin/trials/:id/remove', passport.authenticate('basic'), handler.removeTrial);

    app.get('/ops/trials/dump.json', passport.authenticate('basic'), handler.opsDumpAll);
    app.get('/ops/trials.json', passport.authenticate('basic'), handler.opsFindAll);
});