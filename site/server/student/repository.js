const uuid = require('uuid');
const md5 = require('md5');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const registerOrUpdate = collectionPromise => object => {
    const { name, email, password, availableClasses } = object;
    return collectionPromise
        .then(students => {
            logger.info(`Looking for student with email ${email}`);
            return students.findOne({ email }).then(student => { students, student });
        })
        .then(data => {
            const { students, student } = data;
            if (student) {
                const updatedStudent = {
                    id: student.id,
                    name: name || student.name,
                    name: md5(password) || student.password,
                    name: availableClasses || student.availableClasses
                }
                logger.info(`Updating student with id ${updatedStudent.id} and email ${updatedStudent.email}`);
                students.updateOne({id: student.id}, {$set: updatedStudent});

            } else {
                const newStudent = { id: uuid.v4(), name, email, password, availableClasses };
                logger.info(`Registering student with id ${newStudent.id} and email ${newStudent.email}`);
                students.insertOne(newStudent);
            }
        });
}

module.exports = mongoClient => {
    const collectionPromise = mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            return db.collection('students');
        });
    return {
        registerOrUpdate: registerOrUpdate(collectionPromise)
    }
};