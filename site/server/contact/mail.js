const nodemailer = require('nodemailer');
const senderEmail = 'support@langslearning.com';

const transport = nodemailer.createTransport({
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 587,
    auth: {
        user: 'AKIA4VPONNPUNNKGKELG',
        pass: 'BP/7nE8AzXx4Iq3XCK/k690gXbbZq6R+7prUp7iHFTza'
    }
});

const sendToSupport = (subject, content) => {
    return send('support@langslearning.com', subject, content);
};

const sendToTeachers = (subject, content) => {
    return send(['support@langslearning.com', 'lara@langslearning.com', 'maju@langslearning.com'], subject, content);
};

const send = (email, subject, content) => {
    const message = {
        from: senderEmail, // Sender address
        to: email,         // List of recipients
        subject: subject, // Subject line
        text: content // Plain text body
    };
    return transport.sendMail(message);
};

module.exports = {
    send,
    sendToSupport,
    sendToTeachers
};