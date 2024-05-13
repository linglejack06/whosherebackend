/* eslint-disable no-param-reassign,no-underscore-dangle */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    minLength: 5,
    required: true,
    unique: true,
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
        type: 'String',
        enum: ['MEMBER', 'OWNER'],
        default: 'MEMBER',
      },
      orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
    },
  ],
  activeOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  }],
  notificationToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationToken',
  },
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('User', userSchema);
