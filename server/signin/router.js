const Router = require('../router'),
    handler = require('./handler');

module.exports = new Router(app => {
    app.get('/signin/:token', handler.renderSignin);

    app.post('/signin', handler.signin);

    app.get('/signout', handler.signout);
});