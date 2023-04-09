const express = require('express');
const router = express.Router()

const { createUserPaymentHistoryCsv, createUserPaymentHistoryPdf } = require('../controllers/historyController');
const {isVerifiedOwner, verifyAdmin, verifyToken } = require("../utils/verifyToken");

// Get the user payment history as CSV
router.get('/users/:userId/payments/csv', verifyToken, createUserPaymentHistoryCsv)

// Get the user payment history as CSV
router.get('/users/:userId/payments/pdf', createUserPaymentHistoryPdf)

// Get all the user payment history as CSV - Admin
// router.get('/users/all/ payments/csv', verifyToken, verifyAdmin createAllUserPaymentHistoryCsv)

module.exports = router