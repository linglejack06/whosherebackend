const Ticket = require('../data/models/ticket');

const getAllTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org }).populate('user', { firstName: 1, lastName: 1, username: 1 });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed getting tickets' });
  }
};

const getActiveTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org, active: true }).populate('user', { firstName: 1, lastName: 1, username: 1 });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed getting tickets' });
  }
};

module.exports = { getAllTickets, getActiveTickets };
