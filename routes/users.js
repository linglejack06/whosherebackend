const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    const userForToken = {
      username: user.username,
      id: user.id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });
    const savedUser = await user.save();
    res.status(201).json({ token, name: `${user.firstName} ${user.lastName}` });
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
