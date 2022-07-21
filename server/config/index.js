const adminUserJsonConfig = require('./admin.json'),
    facebookJsonConfig = require('./facebook.json'),
    serverJsonConfig = require('./server.json'),
    awsJsonConfig = require('./aws.json');

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

const awsConfig = {
    accessKeyId: process.env.ACCESS_KEY_ID ||  awsJsonConfig.accessKeyId,
    secretAccessKey: process.env.SECRET_ACCESS_KEY ||  awsJsonConfig.secretAccessKey,
    classesBucket: process.env.CLASSES_BUCKET || awsJsonConfig.classesBucket,
    region: process.env.AWS_REGION ||  awsJsonConfig.region
};

module.exports = {
    adminUserConfig,
    facebookConfig,
    serverConfig,
    awsConfig
}