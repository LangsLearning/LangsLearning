const mongoose = require('mongoose');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const TeacherSchema = new mongoose.Schema({
    name: String,
    alias: String,
    email: String,
    description: String,
    picture: String,
    active: { type: Boolean, default: true },
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

const register = object => {
    const teacher = new Teacher(object);
    logger.info(`Registering Teacher ${teacher.name}`);
    return teacher.save();
};

const findAllBy = query => {
    return Teacher.find(query);
};

module.exports = {
    register,
    findAllBy,
};