const mongoose = require('mongoose'),
    logger = require('../logger');

const TeacherSchema = new mongoose.Schema({
    name: String,
    alias: String,
    email: String,
    description: String,
    picture: String,
    active: { type: Boolean, default: true },
});

TeacherSchema.statics.register = function(object) {
    const teacher = new Teacher(object);
    logger.info(`Registering Teacher ${teacher.name}`);
    return teacher.save();
};

module.exports = mongoose.model('Teacher', TeacherSchema);