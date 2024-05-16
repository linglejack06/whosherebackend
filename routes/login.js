const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrpyt = require('bcrypt');
const User = require('../data/models/user');

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

router.post('/', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    let user;
    if (username.match(EMAIL_REGEX)) {
      user = await User.findOne({ email: username.toLowerCase() }).populate('organizations.orgId', { id: 1, name: 1 }).populate('activeOrganization', { id: 1, name: 1 }).populate('tickets');
    } else {
      user = await User.findOne({ username: username.toLowerCase() }).populate('organizations.orgId', { id: 1, name: 1 }).populate('activeOrganization', { id: 1, name: 1 }).populate('tickets');
    }

    if (user) {
      const pwCorrect = await bcrpyt.compare(password, user.passwordHash);
      if (!pwCorrect) {
        next({
          name: 'AuthError',
          message: 'Invalid Password',
        });
      }
      const userForToken = {
        username: user.username.toLowerCase(),
        id: user.id,
      };
      const token = jwt.sign(userForToken, process.env.SECRET_KEY, {
        expiresIn: '24h',
      });

      const activeTicket = user.tickets.find((t) => t.departureTime === null);
      console.log(activeTicket);
      return res.json({
        token, name: `${user.firstName} ${user.lastName}`, organizations: user.organizations.map((org) => org.orgId), activeOrganization: user.activeOrganization, email: user.email, username: user.username, activeTicket,
      });
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
