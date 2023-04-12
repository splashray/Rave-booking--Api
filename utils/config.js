const dotenv = require ('dotenv')
dotenv.config()

const config = {
    PORT : process.env.PORT || 3000,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    AUTH_EMAIL: process.env.AUTH_EMAIL,
    AUTH_PASS: process.env.AUTH_PASS,
    SITE_URL: process.env.SITE_URL,
    PAYSTACK_CLIENT_ID: process.env.PAYSTACK_CLIENT_ID,
    PAYSTACK_CANCEL_ACTION: process.env.PAYSTACK_CANCEL_ACTION,
    PAYSTACK_CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL
}
module.exports = config