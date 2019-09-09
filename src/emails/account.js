const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gerardo.rmz98@hotmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gerardo.rmz98@hotmail.com',
        subject: 'Goodbye!',
        text: `We are sorry you decided to leave. Is there anything we could have done to improve your experience, ${name}?`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}