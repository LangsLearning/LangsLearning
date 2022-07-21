const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'), { awsConfig } = require('../config');

const s3Client = new S3Client({ region: awsConfig.region });

const upload = async(name, payload) => {
    return s3Client.send(new PutObjectCommand({
        Bucket: awsConfig.classesBucket,
        Body: payload,
        Key: name
    }));
};

module.exports = {
    upload
};