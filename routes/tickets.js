const router = require('express').Router({ mergeParams: true });
const Ticket = require('../data/models/ticket');
const createTicket = require('../utils/createTicket');

const tokenValidator = require('../utils/tokenValidation');
const { getActiveTickets, getTicketsFromTime, getUserTickets } = require('../utils/getTickets');
const deleteTicket = require('../utils/deleteTicket');

router.get('/', async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ organization: req.params.orgId });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/filtered', async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;
    const tickets = await getTicketsFromTime(req.params.orgId, startTime, endTime, next);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/user', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const tickets = await getUserTickets(userId, next);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});
router.get('/unfinished', async (req, res, next) => {
  try {
    const tickets = await getActiveTickets(
      req.params.orgId,
      (err) => next({ name: err.type, message: err.message }),
    );
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

router.delete('/:ticketId', async (req, res, next) => {
  try {
    return deleteTicket(req.params.ticketId, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
