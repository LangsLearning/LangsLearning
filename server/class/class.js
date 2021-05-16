const mongoose = require('mongoose'),
    logger = require('../logger');

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

ClassSchema.statics.register = function(object) {
    logger.info(`Registering Class ${object.title}`);
    return new this(object).save();
};
ClassSchema.statics.deactivateById = function(id) {
    logger.info(`Removing Class with id ${id}`);
    return this.updateOne({ _id: id }, { $set: { active: false } });
};
ClassSchema.statics.assignTeacher = function(classId, teacherId) {
    logger.info(`Assigning class with id ${classId} to teacher with id ${teacherId}`);
    return this.updateOne({ _id: classId }, { $set: { teacherId } });
};
ClassSchema.statics.findAllByIds = function(ids) {
    if (!ids) {
        return Promise.resolve([]);
    }

    logger.info(`Fetching all classes available by ids ${ids}`);
    return this.find({ _id: { $in: ids } });
};
ClassSchema.statics.findAllAvailableFor = student => {
    logger.info(`Fetching all classes available for student ${student._id}`);
    return Class.find({ active: true, students: { $nin: [student._id] }, datetime: { $gte: new Date() }, level: { $eq: student.level } });
};

module.exports = mongoose.model('Class', ClassSchema);