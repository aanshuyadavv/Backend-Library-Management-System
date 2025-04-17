const nodemailer = require("nodemailer");

exports.mailSender = async (to, subject, text) => {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", 
    auth: {
      user: "anshu78358@email.com",  //google email
      pass: "1a2b3c4d5e6f7g", //google password
    },
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: "Anshu Yadav",
    to: `${to}`,
    subject: `${subject}`,
    text: `${text}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
