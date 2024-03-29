const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrpyt = require('bcrypt');
const User = require('../data/models/user');

router.post('/', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user) {
      const pwCorrect = await bcrpyt.compare(password, user.passwordHash);
      if (!pwCorrect) {
        next({
          name: 'AuthError',
          message: 'Invalid Password',
        });
      }
      const userForToken = {
        username: user.username,
        id: user.id,
      };
      const token = jwt.sign(userForToken, process.env.SECRET_KEY, {
        expiresIn: '24h',
      });
      return res.json({ token, name: `${user.firstName} ${user.lastName}` });
    }
    next({
      name: 'AuthError',
      message: 'Invalid Username',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
