const uuid = require('uuid'),
    md5 = require('md5'),
    logger = require('../logger'),
    mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    email: String,
    level: String,
    password: String,
    availableClasses: Number,
    classesIds: [String]
});

StudentSchema.statics.register = function(object) {
    object.password = md5(object.password);
    const student = new Student(object);
    logger.info(`Registering Student with email ${student.email}`);
    return student.save();
};

StudentSchema.statics.addAvailableClasses = async function(email, classesToAdd) {
    const student = await Student.findOne({ email });
    if (!student) {
        throw `Invalid student, ${email}`;
    }

    const updatedStudent = {
        availableClasses: student.availableClasses + classesToAdd
    };
    logger.info(`Adding ${classesToAdd} classes to student with id ${student._id} and email ${student.email}`);
    return Student.updateOne({ _id: student._id }, { $set: updatedStudent });
};

StudentSchema.statics.registerOrUpdate = async function(object) {
    const { name, email, password, availableClasses } = object;
    logger.info(`Looking for student with email ${email}`);
    const student = await Student.findOne({ email });
    if (student) {
        const updatedStudent = {
            name: name || student.name,
            password: md5(password) || student.password,
            availableClasses: availableClasses || student.availableClasses
        }
        logger.info(`Updating student with id ${student._id} and email ${updatedStudent.email}`);
        return Student.updateOne({ _id: student._id }, { $set: updatedStudent });

    } else {
        return register({
            name,
            email,
            password,
            availableClasses
        });
    }
};

StudentSchema.statics.removeAllClassesOf = function(studentId) {
    return Student.updateOne({ _id: studentId }, { $set: { classesIds: [] } });
};

module.exports = mongoose.model('Student', StudentSchema);