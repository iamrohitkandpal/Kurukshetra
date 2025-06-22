const path = require('path');

const User = require(path.join(__dirname, 'User'));
const Product = require(path.join(__dirname, 'Product'));
const File = require(path.join(__dirname, 'File'));
const Feedback = require(path.join(__dirname, 'Feedback'));
const Webhook = require(path.join(__dirname, 'Webhook'));
const Progress = require(path.join(__dirname, 'Progress'));
const AuditLog = require(path.join(__dirname, 'AuditLog'));

module.exports = {
  User,
  Product,
  File,
  Feedback,
  Webhook,
  Progress,
  AuditLog
};