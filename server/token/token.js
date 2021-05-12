const mongoose = require('mongoose'),
    moment = require('moment'),
    SIGNIN = 'signin';

const TokenSchema = new mongoose.Schema({
    type: String,
    expiresAt: Date,
    usedAt: Date,
    trialId: String,
    email: String
});

TokenSchema.statics.createSignInToken = function(trialId, email) {
    const token = new Token({
        type: SIGNIN,
        expiresAt: moment().utc().add(7, 'days'),
        usedAt: null,
        trialId,
        email
    });
    return token.save();
};

TokenSchema.statics.getSigninToken = function(trialId, email) {
    return Token.findById(id).then(token => {
        if (!token || token.type !== SIGNIN || token.usedAt) {
            return Promise.reject('Invalid token');
        } else {
            return Promise.resolve(token);
        }
    });
};

module.exports = mongoose.model('Token', TokenSchema);