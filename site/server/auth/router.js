const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');

const { adminUserConfig, facebookConfig } = require('../config');

const FacebookStrategy = require('passport-facebook').Strategy;

const getEmail = profile => {
    try {
        return profile.emails[0].value;
    } catch (error) {
        return null;
    }
};

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new BasicStrategy(
    (username, password, done) => {
        if (username === adminUserConfig.username && password === adminUserConfig.password) {
            done(null, { username, role: 'admin' });
        } else {
            done(null, false);
        }
    }
));

passport.use(new FacebookStrategy({
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
));

module.exports = {
    apply: (mongoClient, app) => {
        app.use(passport.initialize());
        app.use(passport.session());

        app.get('/admin/login', passport.authenticate('basic'), (req, res) => {
            res.redirect('/trials');
        });
        app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect: '/?trial_class=success',
                failureRedirect: '/?trial_class=error'
            }));
    }
};

/**
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        return null;
    }
));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        console.log(req.body);
        res.redirect('/');
    });
 */