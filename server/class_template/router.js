const passport = require('passport'),
    handler = require('./handler'),
    Router = require('../router');

module.exports = new Router(app => {
    app.get('/admin/class_templates', passport.authenticate('basic'), handler.renderClassTemplatesPage);
    app.post('/admin/class_templates', passport.authenticate('basic'), handler.registerClassTemplate);
});
