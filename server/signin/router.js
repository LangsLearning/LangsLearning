const Router = require('../router'),
    Student = require('../student/student'),
    Trial = require('../trial/trial');

module.exports = new Router(app => {
    const tokens = require('../token/tokens');

    app.get('/signin/:token', (req, res) => {
        const { token } = req.params;
        tokens.getSigninToken(token)
            .then(token => Trial.findById(token.trialId))
            .then(trial => {
                res.render('signin', { email: trial.email, token: token });
            });
    });

    app.post('/signin', (req, res) => {
        const { token, password } = req.body;
        tokens.getSigninToken(token)
            .then(signinToken => Trial.findById(signinToken.trialId))
            .then(trial => {
                const { name, email, level } = trial;
                return Student.register({ name, email, level, password, availableClasses: 0 });
            })
            .then(student => {
                req.session.student = student;
                res.redirect('/student/packages');
            });
    });

    app.get('/signout', (req, res) => {
        req.session.student = null;
        res.redirect('/?logout=true');
    });
});