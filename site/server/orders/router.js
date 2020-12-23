module.exports = {
    apply: app => {
        const handler = require('./handler')();
        app.post('/api/v1/orders', handler.registerOrder);
    }
};