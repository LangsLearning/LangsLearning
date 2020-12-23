const md5 = require('md5');
const sha1 = require('sha1');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const mail = require('../contact/mail');
const ejs = require('ejs');
const path = require('path');

//Lara,
const apiKeys = ['ccb291bc22'];

const isValidSid = (order) => {
    return order.nsid === sha1(order.edz_fat_cod + order.edz_cnt_cod + order.edz_cli_cod);
};

const products = [{
    id: '671302',
    name: 'Primeiros Passos',
    classes: 10
}];

const getStudentNewClassesTemplate = (studentName, packageName, packageClasses, availableClasses) => {
    return ejs.renderFile(path.join(__dirname, '../mails/student-new-classes.html'), {
        studentName,
        packageName,
        packageClasses,
        availableClasses
    });
};

const registerOrder = studentRepository => (req, res) => {
    const order = req.body;
    logger.info(`New order received: ${JSON.stringify(order)}`);
    if (isValidSid(order)) {
        const email = order.edz_cli_email;
        const product = products.find(product => product.id === order.edz_cnt_cod);
        if (!product) {
            logger.error(`Invalid product received: ${order.edz_cnt_cod} for customer ${email}`);
            res.status(400).json({ message: "Invalid product" });
            return;
        }

        studentRepository.addAvailableClasses(email, product.classes)
            .then(student =>
                getStudentNewClassesTemplate(student.name, product.name, product.classes, student.availableClasses).then(html => ({ html, student }))
            )
            .then(data => {
                const { html, student } = data;
                logger.info(`Sending new classes e-mail to user ${student.email} with content ${html}`);
                return mail.sendHtml(student.email, 'LangsLearning - suas aulas já estão disponíveis', html);
            })
            .then(result => {
                res.status(200).json({});
            })
            .catch(err => {
                logger.error(`Not possible to add new available classes to the student, ${err}`);
                res.status(500).json({ message: err });
            });
    } else {
        logger.error(`Invalid order request, invalid SID`);
        res.status(401).json({ message: "Not authorized" });
    }
};

module.exports = () => {
    const studentRepository = require('../student/repository');
    return {
        registerOrder: registerOrder(studentRepository)
    };
};