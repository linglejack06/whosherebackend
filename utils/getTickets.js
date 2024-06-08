const Ticket = require('../data/models/ticket');
const User = require('../data/models/user');

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
      startTime = new Date(start);
    }
    let endTime;
    if (!end) {
      endTime = new Date();
    } else {
      endTime = new Date(end);
    }
    startTime = startTime.getTime();
    endTime = endTime.getTime();

    const tickets = await Ticket.find({ organization: org }).populate('user', { firstName: 1, lastName: 1, username: 1 });
    const filtered = tickets.filter((ticket) => (
      ticket.arrival.getTime() >= startTime
        && ticket.arrival.getTime() <= endTime
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

const getUserTickets = async (userId, handleError) => {
  try {
    if (!userId) {
      handleError({ message: 'No User Id Provided' });
    }
    const user = await User.findById(userId);
    const tickets = await Ticket.find({ user: user.id, organization: user.activeOrganization });
    return tickets;
  } catch (error) {
    return handleError({ message: 'failed to fetch user tickets' });
  }
};

module.exports = {
  getAllTickets, getActiveTickets, getTicketsFromTime, getUserTickets,
};
