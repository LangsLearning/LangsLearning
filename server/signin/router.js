const passport = require('passport'),
    Student = require('../student/student');

module.exports = {
    apply: app => {
        const tokens = require('../token/tokens');
        const trialRepository = require('../trial/repository');

        app.get('/signin/:token', (req, res) => {
            const { token } = req.params;
            tokens.getSigninToken(token)
                .then(token => trialRepository.findById(token.trialId))
                .then(trial => {
                    res.render('signin', { email: trial.email, token: token });
                });
        });

        app.post('/signin', (req, res) => {
            const { token, password } = req.body;
            tokens.getSigninToken(token)
                .then(signinToken => trialRepository.findById(signinToken.trialId))
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
    }
};