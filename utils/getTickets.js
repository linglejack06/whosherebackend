const Ticket = require('../data/models/ticket');

const getAllTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed getting tickets' });
  }
};

const getActiveTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org, active: true });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed getting tickets' });
  }
};

module.exports = { getAllTickets, getActiveTickets };
