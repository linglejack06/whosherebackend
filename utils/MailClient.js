const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendMail = (to, next) => {
  const uniqueCode = Math.floor(Math.random() * 9000 + 1000);
  const emailOptions = {
    from: process.env.GMAIL_USERNAME,
    to,
    subject: 'Reset Password',
    html: `<html>
                <body>
                    <h2>Password Recovery</h2>
                    <p>Use this one time passkey to reset your password.</p>
                    <h3>${uniqueCode}</h3>
                </body>
           </html>`,
  };
  transporter.sendMail(emailOptions, (err, info) => {
    if (err) {
      next(err);
    } else {
      console.log('email success:', info);
    }
  });
  return uniqueCode;
};

module.exports = sendMail;
