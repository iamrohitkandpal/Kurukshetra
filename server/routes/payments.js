const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/payments
 * @desc Process a payment
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  const { amount, cardNumber, cvv, expiryDate, productId } = req.body;
  const userId = req.user.id;
  const db = req.db;

  if (!amount || !cardNumber || !cvv || !expiryDate || !productId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // A02: Cryptographic Failures - Storing sensitive data in plaintext
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // Record payment in SQLite
      const paymentId = await db('payments').insert({
        user_id: userId,
        product_id: productId,
        amount,
        card_number: cardNumber, // A02: Storing full card number
        cvv, // A02: Storing CVV
        expiry_date: expiryDate, // A02: Storing expiry date
        status: 'completed',
        created_at: new Date().toISOString()
      });

      // Update product inventory
      await db('products')
        .where('id', productId)
        .decrement('stock', 1);

      // A09: Security Logging and Monitoring Failures - logging sensitive data
      logger.info(`Payment processed for user ${userId}, amount: ${amount}, card: ${cardNumber}`);

      res.json({
        success: true,
        paymentId,
        message: 'Payment processed successfully'
      });
    } else {
      // For MongoDB
      const Payment = require('mongoose').model('Payment');
      const Product = require('mongoose').model('Product');

      // Record payment in MongoDB
      const payment = await Payment.create({
        userId,
        productId,
        amount,
        cardNumber, // A02: Storing full card number
        cvv, // A02: Storing CVV
        expiryDate, // A02: Storing expiry date
        status: 'completed',
        createdAt: new Date()
      });

      // Update product inventory
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: -1 } }
      );

      // A09: Security Logging and Monitoring Failures - logging sensitive data
      logger.info(`Payment processed for user ${userId}, amount: ${amount}, card: ${cardNumber}`);

      res.json({
        success: true,
        paymentId: payment._id,
        message: 'Payment processed successfully'
      });
    }
  } catch (error) {
    logger.error(`Payment processing error: ${error.message}`);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

/**
 * @route GET /api/payments/history
 * @desc Get payment history for a user
 * @access Private
 */
router.get('/history', auth, async (req, res) => {
  const userId = req.user.id;
  const db = req.db;

  try {
    // A01: Broken Access Control - IDOR vulnerability
    // Users can view any payment history by changing the user_id
    const targetUserId = req.query.userId || userId;

    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // For SQLite
      // A03: SQL Injection vulnerability
      const query = `
        SELECT p.*, pr.name as product_name FROM payments p
        JOIN products pr ON p.product_id = pr.id
        WHERE p.user_id = ${targetUserId}
        ORDER BY p.created_at DESC
      `;
      
      const payments = await db.raw(query);
      res.json(payments);
    } else {
      // For MongoDB
      const Payment = require('mongoose').model('Payment');
      
      const payments = await Payment.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .populate('productId', 'name');
      
      res.json(payments);
    }
  } catch (error) {
    logger.error(`Error fetching payment history: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

/**
 * @route GET /api/payments/:id/receipt
 * @desc Get receipt for a payment
 * @access Private
 */
router.get('/:id/receipt', auth, async (req, res) => {
  const paymentId = req.params.id;
  const userId = req.user.id;
  const db = req.db;

  try {
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // For SQLite
      // A01: Broken Access Control - no verification if payment belongs to user
      const payment = await db('payments')
        .where('id', paymentId)
        .first();
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Generate receipt
      const receipt = {
        id: payment.id,
        date: payment.created_at,
        amount: payment.amount,
        cardNumber: `**** **** **** ${payment.card_number.slice(-4)}`,
        status: payment.status
      };
      
      res.json(receipt);
    } else {
      // For MongoDB
      const Payment = require('mongoose').model('Payment');
      
      // A01: Broken Access Control - no verification if payment belongs to user
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Generate receipt
      const receipt = {
        id: payment._id,
        date: payment.createdAt,
        amount: payment.amount,
        cardNumber: `**** **** **** ${payment.cardNumber.slice(-4)}`,
        status: payment.status
      };
      
      res.json(receipt);
    }
  } catch (error) {
    logger.error(`Error generating receipt: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

/**
 * @route DELETE /api/payments/:id
 * @desc Delete a payment record
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  const paymentId = req.params.id;
  const db = req.db;

  try {
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // A01: Broken Access Control - no verification if payment belongs to user
      await db('payments').where('id', paymentId).del();
    } else {
      // For MongoDB
      const Payment = require('mongoose').model('Payment');
      
      // A01: Broken Access Control - no verification if payment belongs to user
      await Payment.findByIdAndDelete(paymentId);
    }
    
    res.json({ success: true, message: 'Payment record deleted' });
  } catch (error) {
    logger.error(`Error deleting payment: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete payment record' });
  }
});

module.exports = router;