const BasicStrategy = require('passport-http').BasicStrategy,
    { adminUserConfig } = require('../config');

const strategy = new BasicStrategy(
    (username, password, done) => {
        if (username === adminUserConfig.username && password === adminUserConfig.password) {
            done(null, { username, role: 'admin' });
        } else {
            done(null, false);
        }
    }
);

module.exports = {
    strategy
};