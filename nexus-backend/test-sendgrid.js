const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
});

const testEmail = async () => {
  try {
    const from = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM;
    console.log('Testing email send...');
    console.log('From:', from);
    console.log('API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('API Key first 10 chars:', process.env.SENDGRID_API_KEY?.substring(0, 10));
    
    const result = await transporter.sendMail({
      from: `"Nexus" <${from}>`,
      to: 'test@example.com',
      subject: 'Test Email from Nexus',
      html: '<h1>Test Email</h1><p>This is a test email from SendGrid.</p>'
    });
    console.log('✅ Email sent successfully');
    console.log('Response:', result);
  } catch (err) {
    console.error('❌ Email error:');
    console.error('Message:', err.message);
    console.error('Response body:', err.response?.body || 'No response');
    console.error('Status code:', err.response?.status || 'No status');
    if (err.response?.body?.errors) {
      console.error('Errors:', err.response.body.errors);
    }
  }
};

testEmail();
