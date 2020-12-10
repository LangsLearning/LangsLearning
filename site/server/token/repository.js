const uuid = require('uuid');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const register = collectionPromise => token => {
    token.id = uuid.v4();
    logger.info(`Registering Token with id ${token.id} for type ${token.type} and expiration at ${token.expiresAt}`);
    return collectionPromise.then(tokens => tokens.insertOne(token));
};

module.exports = mongoClient => {
    const collectionPromise = mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            return db.collection('tokens');
        });
    return {
        register: register(collectionPromise),
    }
};