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
    logger.info(`Registering Teacher ${object.name}`);
    return this(object).save();
};

module.exports = mongoose.model('Teacher', TeacherSchema);