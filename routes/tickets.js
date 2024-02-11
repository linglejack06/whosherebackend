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

// TODO: convert to websocket ?
router.get('/unfinished', async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ organization: req.params.ordId, departureTime: null });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.post('/', tokenValidator, async (req, res, next) => {
  const { departureDate, departureStatus, arrival } = req.body;
  try {
    const ticket = new Ticket({
      organization: req.params.orgId,
      user: req.decodedToken.id,
      departureTime: departureDate ? new Date(departureDate) : null,
      departureStatus,
      arrival: new Date(arrival),
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

router.put('/:ticketId', async (req, res, next) => {
  const { departureTime, departureStatus } = req.body;
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { departureTime: new Date(departureTime), departureStatus },
      { new: true, runValidators: true, context: 'query' },
    );
    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
