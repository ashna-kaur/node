const nodemailer = require('nodemailer');

const sendEmail = async (options) =>{
  if (String(process.env.EMAIL_DISABLED).toLowerCase() === 'true') {
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: String(process.env.EMAIL_TLS_REJECT_UNAUTHORIZED).toLowerCase() === 'true'
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@localhost',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;