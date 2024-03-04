const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../data/models/user');
const NotificationToken = require('../data/models/notificationToken');

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const {
    username, password, organizations, firstName, lastName,
  } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      passwordHash,
      organizations,
      firstName,
      lastName,
      tickets: [],
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
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

module.exports = router;
