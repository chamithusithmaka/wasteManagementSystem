import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'salemanager516@gmail.com', // hardcoded email
    pass: 'vyzlsmsiybtrvuqn',        // hardcoded app password
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: 'salemanager516@gmail.com', // hardcoded email
      to,
      subject,
      text,
      html,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};