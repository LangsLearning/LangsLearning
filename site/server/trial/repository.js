const uuid = require('uuid');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const findAll = collectionPromise => () => {
    logger.info(`Fetching all trials`);
    return collectionPromise.then(trials => trials.find({ level: null }).toArray());
};

const findById = collectionPromise => id => {
    return collectionPromise.then(trials => trials.findOne({ id }));
};

const register = collectionPromise => trial => {
    trial.id = uuid.v4();
    logger.info(`Registering Trial with id ${trial.id} for user ${trial.email}`);
    return collectionPromise.then(trials => trials.insertOne(trial));
};

const setLevel = collectionPromise => (id, level) => {
    logger.info(`Set level for trial with id ${id} to level ${level}`);
    return collectionPromise.then(trials => trials.updateOne({ id }, { $set: { level } }));
};

const remove = collectionPromise => id => {
    logger.info(`Removing Trial with id ${id}`);
    return collectionPromise.then(trials => trials.deleteOne({ id }));
};

module.exports = mongoClient => {
    const collectionPromise = mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            return db.collection('trials');
        });
    return {
        findAll: findAll(collectionPromise),
        findById: findById(collectionPromise), 
        register: register(collectionPromise),
        remove: remove(collectionPromise),
        setLevel: setLevel(collectionPromise)
    }
};