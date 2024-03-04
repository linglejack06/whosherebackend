/* eslint-disable no-param-reassign,no-underscore-dangle */
const mongoose = require('mongoose');

const notificationToken = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiresAt: {
    type: Date,
    default: Date.now(),
    expires: 2592000, // 30 days
  },
});

notificationToken.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    delete ret._id;
  },
});

module.exports = mongoose.model('NotificationToken', notificationToken);
