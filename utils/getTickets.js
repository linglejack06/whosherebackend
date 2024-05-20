const Ticket = require('../data/models/ticket');

const getAllTickets = async (org, handleError) => {
  try {
    const tickets = await Ticket.find({ organization: org }).populate('user', { firstName: 1, lastName: 1, username: 1 });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed getting tickets' });
  }
};

const getTicketsFromTime = async (org, start, end, handleError) => {
  try {
    let startTime;
    if (!start) {
      startTime = new Date();
      startTime.setDate(startTime.getDate() - 1);
    } else {
      startTime = start;
    }
    let endTime;
    if (!end) {
      endTime = new Date();
    } else {
      endTime = end;
    }
    startTime = startTime.getTime();
    endTime = endTime.getTime();

    const tickets = await Ticket.find({ organization: org }).populate('user', { firstName: 1, lastName: 1, username: 1 });
    const filtered = tickets.filter((ticket) => (
      ticket.departureTime.getTime() >= startTime
        && ticket.departureTime.getTime() <= endTime
    ));
    return filtered;
  } catch (error) {
    handleError({ message: error.message });
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

module.exports = { getAllTickets, getActiveTickets, getTicketsFromTime };
