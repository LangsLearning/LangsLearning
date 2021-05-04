const mongoose = require('mongoose');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const TrialSchema = new mongoose.Schema({
    name: String,
    email: String,
    datetime: Date,
    link: String,
    level: String
});

const Trial = mongoose.model('Trial', TrialSchema);

const findAllBy = query => {
    logger.info(`Fetching all Trials by ${JSON.stringify(query)}`);
    return Trial.find(query);
};

const findById = id => {
    return Trial.findById(id);
};

const register = object => {
    const trial = new Trial(object);
    logger.info(`Registering Trial ${trial}`);
    return trial.save();
};

const setLevel = (id, level) => {
    logger.info(`Set level for Trial with id ${id} to level ${level}`);
    return Trial.updateOne({ _id: id }, { $set: { level } });
};

const remove = id => {
    logger.info(`Removing Trial with id ${id}`);
    return Trial.deleteOne({ _id: id });
};

const removeAllBy = query => {
    logger.warn(`Removing all Trials by ${JSON.stringify(query)}`);
    return Trial.deleteMany(query);
};

module.exports = {
    findAllBy,
    findById,
    register,
    remove,
    removeAllBy,
    setLevel,
};