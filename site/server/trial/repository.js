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

const findAll = () => {
    logger.info(`Fetching all trials`);
    return Trial.find({ level: null });
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
    logger.info(`Set level for trial with id ${id} to level ${level}`);
    return Trial.updateOne({ id }, { $set: { level } });
};

const remove = id => {
    logger.info(`Removing Trial with id ${id}`);
    return Trial.deleteOne({ id });
};

module.exports = {
    findAll,
    findById,
    register,
    remove,
    setLevel
};