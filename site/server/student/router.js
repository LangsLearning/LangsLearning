

module.exports = {
    apply: (mongoClient, app) => {
        app.get('/student', (req, res) => {
            res.render('student');
        });
    }
};