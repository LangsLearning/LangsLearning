const mongoose = require('mongoose');
const moment = require('moment');
const repository = require('./repository');

const TokenSchema = new mongoose.Schema({
    type: String,
    expiresAt: Date,
    usedAt: Date,
    trialId: String,
    email: String
});

const Token = mongoose.model('Token', TokenSchema);

const SIGNIN = 'signin';

const createSignInToken = (trialId, email) => {
    const token = new Token({
        id: uuid.v4(),
        type: SIGNIN,
        expiresAt: moment().utc().add(7, 'days'),
        usedAt: null,
        trialId,
        email
    });
    return token.save();
};

const getSigninToken = id => {
    return Token.findById(id).then(token => {
        if (!token || token.type !== SIGNIN || token.usedAt) {
            return Promise.reject('Invalid token');
        } else {
            return Promise.resolve(token);
        }
    });
};

module.exports = {
    createSignInToken,
    getSigninToken
};