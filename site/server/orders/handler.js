const md5 = require('md5');
const pino = require("pino");
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

//Lara,
const apiKeys = ['ccb291bc22'];

const isValidSid = (order) => {
    const preSid = md5(Object.keys(order).reduce((acc, curr) => acc + curr));
    const validSids = apiKeys.map(apiKey => preSid + apiKey);    
    return validSids.includes(order.sid);
};

const products = [{
    id: '671302',
    classes: 10
}];

const registerOrder = studentRepository => (req, res) => {
    const order = req.body;
    logger.info(`New order received: ${JSON.stringify(order)}`);
    if (isValidSid(order)) {
        const student = {name:'', }
        studentRepository.registerOrUpdate(order)
        res.status(200).json({});
    } else {
        res.status(401).json({message: "Not authorized"});
    }
};

module.exports = mongoClient => {
    const studentRepository = require('../student/repository')(mongoClient);
    return {
        registerOrder: registerOrder(studentRepository)
    };
};