
module.exports = {
    apply: (mongoClient, app) => {
        app.get('/student', (req, res) => {
            console.log(req);
            res.render('student');
        });
    }
};