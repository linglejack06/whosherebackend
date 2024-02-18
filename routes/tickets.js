const router = require('express').Router({ mergeParams: true });
const Ticket = require('../data/models/ticket');
const createTicket = require('../utils/createTicket');

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
  await createTicket(
    { userId: req.decodedToken.id },
    { orgId: req.params.orgId, ...req.body },
    next,
  );
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
