const adminUserJsonConfig = require('./admin.json');
const facebookJsonConfig = require('./facebook.json');
const serverJsonConfig = require('./server.json');

const adminUserConfig = {
    username: process.env.ADMIN_USERNAME || adminUserJsonConfig.username,
    password: process.env.ADMIN_PASSWORD || adminUserJsonConfig.password
};

const facebookConfig = {
    clientId: process.env.FACEBOOK_CLIENT_ID || facebookJsonConfig.clientId,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || facebookJsonConfig.clientSecret,
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL || facebookJsonConfig.callbackUrl,
};

const serverConfig = {
    url: process.env.SERVER_URL || serverJsonConfig.url
};

module.exports = {
    adminUserConfig,
    facebookConfig,
    serverConfig
}
