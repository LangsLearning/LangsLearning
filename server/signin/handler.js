const Handler = require('../handler'),
    { Student } = require('../student'),
    { Trial } = require('../trial'),
    { Token } = require('../token');

const renderSignin = new Handler(async(req, res) => {
    const { token } = req.params;
    const signinToken = await Token.getSigninToken(token);
    const trial = await Trial.findById(signinToken.trialId);
    res.render('signin', { email: trial.email, token: token });

}).onErrorRedirect('/?signin=error');

const signin = new Handler(async(req, res) => {
    const { token, password } = req.body;
    const signinToken = await Token.getSigninToken(token);
    const trial = await Trial.findById(signinToken.trialId);
    const { name, email, level } = trial;
    const student = await Student.register({ name, email, level, password, availableClasses: 0 });
    req.session.student = student;
    res.redirect('/student/packages');

}).onErrorRedirect('/?signin=error');

const signout = new Handler((req, res) => {
    req.session.student = null;
    res.redirect('/?logout=true');

}).onErrorRedirect('/?logout=error');

module.exports = { renderSignin, signin, signout };