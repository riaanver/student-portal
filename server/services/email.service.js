const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendTemporaryPasswordEmail({
    recipientEmail,
    studentName,
    temporaryPassword
}) {
    await transporter.sendMail({
        from: `"EdMedTech Healthcare Solutions" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Your temporary EdMedTech password',
        text: `
Hello ${studentName},

Your EdMedTech registration was successful.

Your temporary password is:

${temporaryPassword}

Please log in using your email address and this temporary password. You will be required to create a new password after logging in.

Do not share this password with anyone.
        `.trim()
    });
}

module.exports = {
    sendTemporaryPasswordEmail
};