const Ticket = require('../data/models/ticket');

const getAllTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org });
    return tickets;
  } catch (error) {
    return handleError(error);
  }
};

const getActiveTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org, active: true });
    return tickets;
  } catch (error) {
    return handleError(error);
  }
};

module.exports = { getAllTickets, getActiveTickets };
