const mongoose = require('mongoose'),
    logger = require('../logger');

const ClassTemplateSchema = new mongoose.Schema({
    title: String,
    description: String,
    level: String,
    materialLink: String,
    active: { type: Boolean, default: true }
});

ClassTemplateSchema.statics.register = function(object) {
    logger.info(`Registering Class Template ${object.title}`);
    return new this(object).save();
};
ClassTemplateSchema.statics.deactivateById = function(id) {
    logger.info(`Removing Class Template with id ${id}`);
    return this.updateOne({ _id: id }, { $set: { active: false } });
};
ClassTemplateSchema.statics.findAll = function() {
    logger.info(`Fetching all active Classes Templates`);
    return this.find({ active: true }).sort({ title: 1 });
};

module.exports = mongoose.model('ClassTemplate', ClassTemplateSchema);
