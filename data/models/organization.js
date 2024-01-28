/* eslint-disable no-param-reassign,no-underscore-dangle */
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: String,
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  owner: {
    type: mongoose.schema.Types.ObjectId,
    ref: 'User',
  },
});

organizationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Organization', organizationSchema);
