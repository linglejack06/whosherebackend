/* eslint-disable no-param-reassign,no-underscore-dangle */
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: String,
  passwordHash: String,
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  ],
});

organizationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Organization', organizationSchema);
