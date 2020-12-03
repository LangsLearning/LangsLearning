module.exports = {
    apply: (mongoClient, app) => {
        const handler = require('./handler')(mongoClient);

        app.get('/trials', handler.getTrials);
        app.post('/trials', handler.registerTrial);
        app.post('/trials/level', handler.setLevel);
    }
}