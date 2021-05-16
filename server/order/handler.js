const md5 = require('md5'),
    sha1 = require('sha1'),
    mail = require('../contact/mail'),
    ejs = require('ejs'),
    path = require('path'),
    logger = require('../logger'),
    { Student } = require('../student'),
    Handler = require('../handler');

//Lara,
const apiKeys = ['ccb291bc22'];

const isValidSid = (order) => {
    return order.nsid === sha1(order.edz_fat_cod + order.edz_cnt_cod + order.edz_cli_cod);
};

const products = [{
    _id: '671302',
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

const registerOrder = new Handler(async(req, res) => {
    const order = req.body;
    logger.info(`New order received: ${JSON.stringify(order)}`);
    if (!isValidSid(order)) {
        logger.error(`Invalid order request, invalid SID`);
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    const email = order.edz_cli_email;
    const product = products.find(product => product._id === order.edz_cnt_cod);
    if (!product) {
        logger.error(`Invalid product received: ${order.edz_cnt_cod} for customer ${email}`);
        res.status(400).json({ message: "Invalid product" });
        return;
    }

    const student = await Student.addAvailableClasses(email, product.classes);
    const html = await getStudentNewClassesTemplate(student.name, product.name, product.classes, student.availableClasses);
    const _ = await mail.sendHtml(student.email, 'LangsLearning - suas aulas já estão disponíveis', html);
    res.status(200).json({});

}).onErrorRespondJson(500);

module.exports = {
    registerOrder
};