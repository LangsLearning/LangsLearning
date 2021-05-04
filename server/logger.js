const pino = require('pino'),
    logger = pino({ level: process.env.LOG_LEVEL || 'info' });

module.exports = logger;