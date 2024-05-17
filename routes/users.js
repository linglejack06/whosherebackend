const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const NotificationToken = require('../data/models/notificationToken');
const changeActiveOrganization = require('../utils/changeActiveOrganization');
const sendMail = require('../utils/MailClient');

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).populate('organizations.orgId');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const {
    email, username, password, organizations, firstName, lastName,
  } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
      organizations,
      firstName,
      lastName,
      tickets: [],
      activeOrg: null,
    });
    const userForToken = {
      username: user.username,
      id: user.id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });
    await user.save();
    res.status(201).json({
      token, name: `${user.firstName} ${user.lastName}`, username, email,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:token', async (req, res, next) => {
  const { token } = req.params;
  try {
    const decodedToken = await jwt.decode(token, process.env.SECRET_KEY);
    if (decodedToken) {
      const user = await User.findById(decodedToken.id).populate('organizations.orgId', { name: 1, id: 1 }).populate('activeOrganization', { id: 1, name: 1 }).populate('tickets');
      const activeTicket = user.tickets.find((t) => t.departureTime === null);
      console.log(activeTicket);
      return res.json({
        name: `${user.firstName} ${user.lastName}`, organizations: user.organizations.map((org) => org.orgId), username: user.username, activeOrganization: user.activeOrganization, active: true, activeTicket, email: user.email,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notificationToken', async (req, res, next) => {
  const { notifToken } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const notif = new NotificationToken({
      user: user.id,
      token: notifToken,
    });
    user.notificationToken = notif.id;
    await user.save();
    return res.status(201);
  } catch (error) {
    next(error);
  }
});

router.post('/:token/activeOrganization', async (req, res, next) => {
  try {
    const decodedToken = await jwt.decode(req.params.token, process.env.SECRET_KEY);
    if (decodedToken) {
      const user = await changeActiveOrganization(decodedToken.id, req.body.orgId, next);
      return res.json(user);
    }
  } catch (error) {
    return next(error);
  }
});

// router.post('/verifyEmail', async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (user) {
//       user.otp = sendMail(user.email, next);
//       await user.save();
//       return res.status(200);
//     }
//     return next({ name: 'EmailError', message: 'Email does not exist for a user' });
//   } catch (err) {
//     return next(err);
//   }
// });
//
// router.post('/resetPassword', async (req, res, next) => {
//   try {
//     const { otp, email, newPassword } = req.body;
//     const user = await User.findOne({ email });
//     if (user && (user.otp !== null && user.otp === parseInt(otp, 10))) {
//       user.passwordHash = await bcrypt.hash(newPassword, 10);
//       await user.save();
//       return res.status(200);
//     }
//     return next({ name: 'EmailError', message: 'One time password has expired' });
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;
