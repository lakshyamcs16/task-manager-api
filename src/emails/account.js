const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'apooos3@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
}

const sendExitEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'apooos3@gmail.com',
        subject: `Goodbye, ${name}!`,
        html: 'Sad to see you go. Please let us know how we can serve better by <a href="https://cshons.wordpress.com/">contacting us on wordpress.</a>'
    });
}

module.exports = {
    sendWelcomeEmail,
    sendExitEmail
}