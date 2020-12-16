const md5 = require('md5');
const sha1 = require('sha1');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

//Lara,
const apiKeys = ['ccb291bc22'];

const isValidSid = (order) => {
    return order.nsid === sha1(order.edz_fat_cod + order.edz_cnt_cod + order.edz_cli_cod);
};

const products = [{
    id: '671302',
    classes: 10
}];

const registerOrder = studentRepository => (req, res) => {
    const order = req.body;
    logger.info(`New order received: ${JSON.stringify(order)}`);
    if (isValidSid(order)) {
        const email = order.edz_cli_email;
        const classesToAdd = products.find(product => product.id === order.edz_cnt_cod).classes;
        if (!classesToAdd) {
            logger.error(`Invalid product received: ${order.edz_cnt_cod} for customer ${email}`);
            res.status(400).json({ message: "Invalid product" });
            return;
        }

        studentRepository.addAvailableClasses(email, classesToAdd)
            .then(student => {
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

module.exports = mongoClient => {
    const studentRepository = require('../student/repository')(mongoClient);
    return {
        registerOrder: registerOrder(studentRepository)
    };
};