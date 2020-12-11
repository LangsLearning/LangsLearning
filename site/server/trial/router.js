const passport = require('passport');

module.exports = {
    apply: (mongoClient, app) => {
        const handler = require('./handler')(mongoClient);

        app.get('/trials', passport.authenticate('basic'), handler.getTrials);
        app.post('/trials', passport.authenticate('basic'), handler.registerTrial);
        app.post('/trials/level', passport.authenticate('basic'), handler.setLevel);
        app.get('/trials/:id/remove', passport.authenticate('basic'), handler.removeTrial);
    }
}