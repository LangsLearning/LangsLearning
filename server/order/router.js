const handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.post('/api/v1/orders', handler.registerOrder);
});