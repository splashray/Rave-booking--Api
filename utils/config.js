import dotenv from 'dotenv'

dotenv.config()

export default {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    // PAYSTACK_CLIENT_ID: process.env.PAYSTACK_CLIENT_ID,
    // PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,

}