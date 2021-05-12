const uuid = require('uuid');
const md5 = require('md5');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mongoose = require('mongoose');

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

StudentSchema.statics.addAvailableClasses = function(email, classesToAdd) {
    return Student.findOne({ email })
        .then(student => {
            if (!student) {
                return Promise.reject(`Invalid student, ${email}`);
            }

            const updatedStudent = {
                availableClasses: student.availableClasses + classesToAdd
            };
            logger.info(`Adding ${classesToAdd} classes to student with id ${student._id} and email ${student.email}`);
            return Student.updateOne({ _id: student._id }, { $set: updatedStudent });
        });
};

StudentSchema.statics.registerOrUpdate = function(object) {
    const { name, email, password, availableClasses } = object;
    logger.info(`Looking for student with email ${email}`);
    return Student.findOne({ email })
        .then(student => {
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
        });
};

StudentSchema.statics.removeAllClassesOf = function(studentId) {
    return Student.updateOne({ _id: studentId }, { $set: { classesIds: [] } });
};

const findAllBy = query => {
    return Student.find(query);
};

const findById = id => {
    return Student.findById(id);
};

const findByEmail = email => {
    return Student.findOne({ email });
};

const removeAllBy = query => {
    return Student.deleteMany(query);
};

module.exports = mongoose.model('Student', StudentSchema);