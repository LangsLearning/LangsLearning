
module.exports = {
    apply: (mongoClient, app) => {
        app.get('/student/bookaclass', (req, res) => {
            res.render('student_bookclass');
        });
        app.get('/student/packages', (req, res) => {
            res.render('student_packages');
        });
    }
};