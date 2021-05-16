const mongoose = require('mongoose'),
    logger = require('../logger');

const TrialSchema = new mongoose.Schema({
    name: String,
    email: String,
    datetime: Date,
    link: String,
    level: String
});

TrialSchema.statics.register = function(object) {
    const trial = this(object);
    logger.info(`Registering Trial ${trial}`);
    return trial.save();
};

TrialSchema.statics.setLevel = function(object) {
    logger.info(`Set level for Trial with id ${id} to level ${level}`);
    return this.updateOne({ _id: id }, { $set: { level } });
};

module.exports = mongoose.model('Trial', TrialSchema);