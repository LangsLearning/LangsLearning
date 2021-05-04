const logger = require('../logger'),
    handler = require('./handler'),
    passport = require('passport');

module.exports = app => {
    app.get('/admin/login', passport.authenticate('basic'), handler.login);
    app.get('/admin/logout', handler.logout);

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/?trial_class=success',
            failureRedirect: '/?trial_class=error'
        }));
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