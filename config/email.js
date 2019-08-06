const mailer = require("nodemailer");

// If using gmail for email delivery, replace transporter with the following
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'youremail@gmail.com',
//     pass: 'yourpassword'
//   }
// });


const transporter = mailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'username',
    pass: 'password'
  }
});

transporter.verify(function(error, success) {
  if (error) {
    throw error;
  }
});

module.exports = transporter;