const passport = require('passport');

module.exports = {
    apply: (mongoClient, app) => {
        const tokens = require('../token/tokens')(mongoClient);
        const trialRepository = require('../trial/repository')(mongoClient);
        const studentRepository = require('../student/repository')(mongoClient);

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
                    const student = { name, email } = trial;
                    student.password = password;
                    student.availableClasses = 0;
                    return studentRepository.register(student);
                })
                .then(student => {
                    req.session.student = student;
                    res.redirect('/student/packages');
                });
        });
    }
};