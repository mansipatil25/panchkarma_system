const { sendMail } = require('./services/emailService');
require('dotenv').config();

(async () => {
  try {
    const to = process.argv.includes('--to')
      ? process.argv[process.argv.indexOf('--to') + 1]
      : (process.env.EMAIL_TO || process.env.EMAIL_USER);

    if (!to) {
      console.error('Please provide a recipient: npm run send-test-email -- --to you@example.com');
      process.exit(1);
    }

    console.log(`Sending test email to: ${to}`);

    const info = await sendMail({
      to,
      subject: 'Niramay test email - SMTP check',
      text: 'This is a test email from Niramay Panchakarma backend to verify SMTP configuration.',
      html: '<p>This is a <strong>test email</strong> from Niramay Panchakarma backend to verify SMTP configuration.</p>'
    });

    console.log('Message sent. Transport response:', info && (info.messageId || info.response || 'OK'));
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:', err.message);
    process.exit(1);
  }
})();