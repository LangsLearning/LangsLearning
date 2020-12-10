module.exports = {
    apply: (mongoClient, app) => {
        const handler = require('./handler')(mongoClient);
        app.post('/orders', handler.registerOrder);
    }
};