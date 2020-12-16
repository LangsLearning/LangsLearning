module.exports = {
    apply: (mongoClient, app) => {
        const handler = require('./handler')(mongoClient);
        app.post('/api/v1/orders', handler.registerOrder);
    }
};