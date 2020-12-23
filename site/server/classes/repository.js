const mongoose = require('mongoose');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const ClassSchema = new mongoose.Schema({
    title: String,
    description: String,
    level: String,
    datetime: Date,
    materialLink: String,
    classLink: String,
    active: { type: Boolean, default: true },
    teacherId: String,
    students: [String]
});

const Class = mongoose.model('Class', ClassSchema);

const findAll = () => {
    logger.info(`Fetching all classes`);
    return Class.find({ active: true });
};

const findAllAvailableFor = studentId => {
    logger.info(`Fetching all classes available for student ${studentId}`);
    return Class.find({ active: true, students: { $nin: [studentId] } });
};

const register = object => {
    const aClass = new Class(object);
    logger.info(`Registering Class ${aClass}`);
    return aClass.save();
};

const remove = id => {
    logger.info(`Removing Class with id ${id}`);
    return Class.updateOne({ id }, { $set: { active: false } });
};

module.exports = {
    findAll,
    findAllAvailableFor,
    register,
    remove,
};