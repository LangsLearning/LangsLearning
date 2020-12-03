const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const uuid = require('uuid');

module.exports = {
    apply: (mongoClient, app) => {
        app.get('/trials', (req, res) => {
            mongoClient.connect()
                .then(client => {
                    const db = client.db("langslearning");
                    logger.info('Fetching trials in the database...');
                    return db.collection('trials').find({level: null}).toArray();
                })
                .then(trials => {
                    logger.info(`${trials.length} trials found`)
                    res.render('trials', { trials });
                })
                .catch(err => {
                    logger.error(err);
                    res.render('trials', { trials: [] });
                });
        });


        app.post('/trials', (req, res) => {
            const { name, email, datetime, link } = req.body;

            if (!name || !email || !datetime || !link) {
                logger.error('Invalid trial data to be registered');
                res.render('trials', { error: 'Could not register the trial class' });
                return;
            }

            const trial = { id: uuid.v4(), name, email, datetime, link };

            mongoClient.connect()
                .then(client => {
                    const db = client.db("langslearning");
                    logger.info(`Registering trial ${trial} in the database...`);
                    return db.collection('trials').insertOne(trial);
                })
                .then(result => {
                    res.redirect('/trials');
                })
                .catch(err => {
                    logger.error(err);
                    res.redirect('/trials');
                });
        });

        app.post('/trials/level', (req, res) => {
            const { id, level } = req.body;

            if (!id || !level) {
                logger.error('Could not set student level, invalid id or level');
                res.render('trials', { error: 'Could not set student level' });
                return;
            }

            mongoClient.connect()
                .then(client => {
                    const db = client.db("langslearning");
                    logger.info(`Updating level of student ${id} to ${level}`);
                    return db.collection('trials').updateOne({ id }, {$set: { level }});
                })
                .then(result => {
                    res.redirect('/trials');
                })
                .catch(err => {
                    logger.error(err);
                    res.redirect('/trials');
                });
        });
    }
}