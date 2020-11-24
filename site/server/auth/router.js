const passport = require('passport');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "862620514500093",
    clientSecret: "a459e88b6e25755c9fc7e0ad84e3813c",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
},
    (accessToken, refreshToken, profile, done) => {
        logger.info(`accessToken: ${accessToken}, refreshToken: ${refreshToken}, profile: ${profile}`);
        done(null);
    }
));

module.exports = {
    apply: (app) => {
        app.get('/auth/facebook', passport.authenticate('facebook'));

        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect: '/',
                failureRedirect: '/student'
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