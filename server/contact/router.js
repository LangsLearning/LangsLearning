const handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.get('/contact', handler.getContactToken);
    app.post('/contact', handler.sendContact);
    app.post('/contact/trial', handler.requestTrial);
});