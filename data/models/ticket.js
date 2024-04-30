/* eslint-disable no-underscore-dangle,no-param-reassign */
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  arrival: {
    type: Date,
    required: true,
  },
  departureTime: {
    type: Date,
  },
  departureStatus: {
    type: String,
    enum: ['ARMED', 'UNARMED'],
    default: 'UNARMED',
  },
  active: Boolean,
});

ticketSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    // todo: convert dates to javascript date object
  },
});

module.exports = mongoose.model('Ticket', ticketSchema);
