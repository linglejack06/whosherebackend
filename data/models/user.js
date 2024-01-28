/* eslint-disable no-param-reassign,no-underscore-dangle */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 5,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    minLength: 2,
  },
  lastName: {
    type: String,
    required: true,
  },
  passwordHash: String,
  organizations: [
    {
      role: {
        enum: ['member', 'owner'],
      },
      orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
    },
  ],
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model('User', userSchema);
