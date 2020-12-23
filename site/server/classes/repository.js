const uuid = require('uuid');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const findAll = collectionPromise => () => {
    logger.info(`Fetching all classes`);
    return collectionPromise.then(classes => classes.find({ active: true }).toArray());
};

const findAllAvailableFor = collectionPromise => studentId => {
    logger.info(`Fetching all classes available for student ${studentId}`);
    return collectionPromise.then(classes => classes.find({ active: true, students: { $nin: [studentId] } }))
};

const register = collectionPromise => aClass => {
    aClass.id = uuid.v4();
    aClass.active = true;
    logger.info(`Registering Class with id ${aClass.id}`);
    return collectionPromise.then(classes => classes.insertOne(aClass).then(result => aClass));
};

const remove = collectionPromise => id => {
    logger.info(`Removing Class with id ${id}`);
    return collectionPromise.then(classes => classes.updateOne({ id }, { $set: { active: false } }));
};

module.exports = mongoClient => {
    const collectionPromise = mongoClient.connect()
        .then(client => {
            const db = client.db('langslearning');
            return db.collection('classes');
        });
    return {
        findAll: findAll(collectionPromise),
        findAllAvailableFor: findAllAvailableFor(collectionPromise),
        register: register(collectionPromise),
        remove: remove(collectionPromise),
    }
};