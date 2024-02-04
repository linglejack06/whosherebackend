const router = require('express').Router({ mergeParams: true });
const Ticket = require('../data/models/ticket');
const User = require('../data/models/user');
const Organization = require('../data/models/organization');

const tokenValidator = require('../utils/tokenValidation');

router.get('/', async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ organization: req.params.orgId });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.post('/', tokenValidator, async (req, res, next) => {
  try {
    const ticket = new Ticket({
      organization: req.params.orgId,
      user: req.decodedToken.id,
      departureTime: new Date(),
      departureStatus: 'armed',
      arrival: new Date(),
    });
    const savedTicket = await ticket.save();
    // add ticket to user
    const user = await User.findById(req.decodedToken.id);
    user.tickets = user.tickets.concat(savedTicket.id);
    await user.save();

    // add ticket to organization
    const organization = await Organization.findById(req.params.orgId);
    organization.tickets = organization.tickets.concat(savedTicket.id);
    await organization.save();

    res.status(201).json(savedTicket);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
