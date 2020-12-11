const uuid = require('uuid');
const moment = require('moment');

const createSignInToken = repository => (trialId, email) => {
    const token = {
        id: uuid.v4(),
        type: 'signin',
        expiresAt: moment().utc().add(7, 'days'),
        usedAt: null,
        trialId,
        email
    };
    return repository.register(token).then(result => token);
};

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    return {
        createSignInToken: createSignInToken(repository)
    };
}