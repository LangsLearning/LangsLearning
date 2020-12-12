const uuid = require('uuid');
const moment = require('moment');
const repository = require('./repository');

const SIGNIN = 'signin';

const createSignInToken = repository => (trialId, email) => {
    const token = {
        id: uuid.v4(),
        type: SIGNIN,
        expiresAt: moment().utc().add(7, 'days'),
        usedAt: null,
        trialId,
        email
    };
    return repository.register(token).then(result => token);
};

const getSigninToken = repository => id => {
    return repository.findById(id).then(token => {
        if (!token || token.type !== SIGNIN || token.usedAt) {
            return Promise.reject('Invalid token');
        } else {
            return Promise.resolve(token);
        }
    });
};

module.exports = mongoClient => {
    const repository = require('./repository')(mongoClient);
    return {
        createSignInToken: createSignInToken(repository),
        getSigninToken: getSigninToken(repository),
    };
}