const handler = require('./handler');

module.exports = {
    apply: app => {
        app.post('/api/v1/orders', handler.registerOrder);
    }
};