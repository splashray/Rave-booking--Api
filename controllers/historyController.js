const Payment = require('../models/paymentModel');
const fs = require('fs').promises;
const path = require('path')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const streamToBlob = require('stream-to-blob');
// const fetch = require('node-fetch');


const createUserPaymentHistoryCsv = async (req, res) => {

  try {
    const payments = await Payment.findOne({ userId: req.params.userId }).populate('paymentRecords.bookingId');
    if (!payments) {
      return res.status(404).send({ message: 'User payment record not found' });
    }

    const csvWriter = createCsvWriter({
      path: `${__dirname}/user-payment-record.csv`,
      header: [
        { id: 'bookingId', title: 'Booking ID' },
        { id: 'amount', title: 'Amount' },
        { id: 'status', title: 'Status' },
        { id: 'paymentType', title: 'Payment Type' },
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'date', title: 'Date' },
      ]
    });

    const csvData = payments.paymentRecords.map(record => {
      return {
        bookingId: record.customBookingId,
        amount: record.amount,
        status: record.status,
        paymentType: record.paymentType,
        transactionId: record.transactionId,
        date: record.date.toISOString(),
      };
    });

    await csvWriter.writeRecords(csvData);

    const file = `${__dirname}/user-payment-record.csv`;
    res.set({
      'Content-Disposition': `attachment; filename=${payments.userId}-payment-record.csv`,
      'Content-Type': 'text/csv'
    });

    res.status(200).sendFile(file, async (err) => {
      if (err) {
        res.status(500).send({ message: 'Failed to download CSV file' });
      }
      await fs.unlink(file);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
}

// const createPdf = async (payments, res, startDate, endDate, limit, skip) => {
//   try {
//     // const font = fontkit.openSync(path.join(__dirname, '..', 'fonts', 'Helvetica.ttf'));
//     const doc = new PDFDocument({ size: 'A4' });
//     const filename = `${payments.userId}-payment-record.pdf`;
//     res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
//     res.setHeader('Content-type', 'application/pdf');

//     doc.font('Helvetica');

//     doc.fontSize(20).text(`Payment History for User ID: ${payments.userId}`, { align: 'center' });
//     doc.moveDown();

//     const table = {
//       headers: ['Booking ID', 'Amount', 'Status', 'Payment Type', 'Transaction ID', 'Date'],
//       rows: []
//     };

//     const records = payments.paymentRecords.filter(record => {
//       const date = new Date(record.date);
//       return (!startDate || date >= new Date(startDate)) && 
//              (!endDate || date <= new Date(endDate));
//     }).slice(skip || 0, limit || payments.paymentRecords.length);

//     records.forEach(record => {
//       table.rows.push([
//         record.customBookingId,
//         record.amount,
//         record.status,
//         record.paymentType,
//         record.transactionId,
//         record.date.toISOString(),
//       ]);
//     });

//     const tableOptions = {
//       width: 500,
//       align: 'center',
//       padding: 1,
//       margin: { top: 30, bottom: 30 },
//       headerStyles: {
//         fillColor: '#000',
//         color: '#fff',
//         bold: true,
//         fontSize: 12
//       },
//       cellStyles: {
//         fontSize: 10,
//         valign: 'top'
//       },
//       layout: 'lightHorizontalLines'
//     };

//     doc.table(table, tableOptions);

//     doc.end();
//     doc.pipe(res);

//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// }

// const createUserPaymentHistoryPdf = async (req, res) => {
//   try {
//     const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
//     const limit = req.query.limit ? parseInt(req.query.limit) : 10;
//     const skip = req.query.skip ? parseInt(req.query.skip) : 0;

//     const payments = await Payment.findOne({ userId: req.params.userId }).populate('paymentRecords.bookingId');
//     if (!payments) {
//       return res.status(404).send({ message: 'User payment record not found' });
//     }

//     createPdf(payments, res, startDate, endDate, limit, skip);

//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// }

 const createUserPaymentHistoryPdf = async (req, res) => {
//   try {
//     const payments = await Payment.findOne({ userId: req.params.userId }).populate('paymentRecords.bookingId');
//     if (!payments) {
//       return res.status(404).send({ message: 'User payment record not found' });
//     }

//     const pdfDoc = new PDFDocument({ bufferPages: true });

//     // set response headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${payments.userId}-payment-record.pdf`);

//     // generate the PDF content
//     pdfDoc.text(`Transaction History for User ${payments.userId}`, {
//       align: 'center',
//       font: 'Helvetica-Bold',
//       fontSize: 18,
//     });

//     pdfDoc.moveDown();

//     pdfDoc.fontSize(12).font('Helvetica');

//     pdfDoc.text('Booking ID', { bold: true });
//     pdfDoc.text('Amount', { bold: true });
//     pdfDoc.text('Status', { bold: true });
//     pdfDoc.text('Payment Type', { bold: true });
//     pdfDoc.text('Transaction ID', { bold: true });
//     pdfDoc.text('Date', { bold: true });
//     pdfDoc.moveDown();

//     payments.paymentRecords.forEach(record => {
//       pdfDoc.text(record.customBookingId);
//       pdfDoc.text(record.amount.toString());
//       pdfDoc.text(record.status);
//       pdfDoc.text(record.paymentType);
//       pdfDoc.text(record.transactionId);
//       pdfDoc.text(record.date.toISOString());
//       pdfDoc.moveDown();
//     });

//     // finalize the PDF and send the response
//     pdfDoc.end();

//     const chunks = [];
//     pdfDoc.on('data', chunk => chunks.push(chunk));
//     pdfDoc.on('end', async () => {
//       const response = await fetch('https://api.github.com/repos/node-fetch/node-fetch');
//       const blobPolyfill = await response.blob();
//       const blob = await streamToBlob(new blobPolyfill.constructor(chunks, { type: 'application/pdf' }));
//       res.send(blob);
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
}

module.exports = {
  createUserPaymentHistoryCsv, createUserPaymentHistoryPdf
}

