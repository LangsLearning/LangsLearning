const uuid = require('uuid');
const md5 = require('md5');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const register = collectionPromise => object => collectionPromise.then(students => {
    const student = { name, email, password, availableClasses } = object;
    student.id = uuid.v4();
    logger.info(`Registering student with id ${student.id} and email ${student.email}`);
    return students.insertOne(student).then(result => student);
});

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
                return students.updateOne({ id: student.id }, { $set: updatedStudent }).then(result => updatedStudent);

            } else {
                return register(collectionPromise)({
                    name,
                    email,
                    password: md5(password),
                    availableClasses
                });
            }
        });
};

const findAllBy = collectionPromise => query => {
    return collectionPromise.then(students => students.find(query).toArray());
};

const findById = collectionPromise => id => {
    return collectionPromise.then(students => students.findOne({ id }));
};

const findByEmail = collectionPromise => email => {
    return collectionPromise.then(students => students.findOne({ email }));
};

const deleteBy = collectionPromise => query => {
    return collectionPromise.then(students => students.remove(query));
};

module.exports = mongoClient => {
    const collectionPromise = mongoClient.connect()
        .then(client => {
            const db = client.db("langslearning");
            return db.collection('students');
        });
    return {
        register: register(collectionPromise),
        registerOrUpdate: registerOrUpdate(collectionPromise),
        findAllBy: findAllBy(collectionPromise),
        findById: findById(collectionPromise),
        findByEmail: findByEmail(collectionPromise),
        deleteBy: deleteBy(collectionPromise),
    }
};