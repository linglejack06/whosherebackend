const express = require('express');
const User = require('../data/models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).populate('tickets').populate('organizations');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {

});

module.exports = router;
