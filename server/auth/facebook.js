const FacebookStrategy = require('passport-facebook').Strategy,
    mail = require('../contact/mail'),
    logger = require('../logger'),
    { facebookConfig } = require('../config');

const getEmail = profile => {
    try {
        return profile.emails[0].value;
    } catch (error) {
        return null;
    }
};

const strategy = new FacebookStrategy({
        clientID: facebookConfig.clientId,
        clientSecret: facebookConfig.clientSecret,
        callbackURL: facebookConfig.callbackUrl,
        profileFields: ['emails']
    },
    (accessToken, refreshToken, profile, done) => {
        const email = getEmail(profile);
        if (email) {
            logger.info(`Sending trial class e-mail for email: ${email}...`);
            mail.sendToTeachers('Trial class', `There is a new user requesting trial class. Email: ${email}`)
            done(null, { email });
        } else {
            done(new Error("User has no e-mail"), profile);
        }
    }
);

module.exports = {
    strategy
};