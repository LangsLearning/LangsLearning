const passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    facebook = require('./facebook'),
    basic = require('./basic'),
    logger = require('../logger');

const init = () => {
    logger.info('Initializing password: basic and facebook strategies');
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(facebook.strategy);
    passport.use(basic.strategy);
};

module.exports = app => {
    init();
    require('./router')(app);
};