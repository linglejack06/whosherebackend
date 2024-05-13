const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const NotificationToken = require('../data/models/notificationToken');
const changeActiveOrganization = require('../utils/changeActiveOrganization');

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
      email,
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
    const savedUser = await user.save();
    res.status(201).json({
      token, name: `${user.firstName} ${user.lastName}`, username,
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
        name: `${user.firstName} ${user.lastName}`, organizations: user.organizations.map((org) => org.orgId), username: user.username, activeOrganization: user.activeOrganization, active: true, activeTicket,
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

module.exports = router;
