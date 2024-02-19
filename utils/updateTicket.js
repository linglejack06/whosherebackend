const Ticket = require('../data/models/ticket');

const updateTicketArrival = async (id, arrival, handleError) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(id, { arrival: new Date(arrival) });
    return ticket;
  } catch (error) {
    handleError(error);
  }
};

const updateTicketStatus = async (id, active, handleError) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(id, { active });
    return ticket;
  } catch (error) {
    handleError(error);
  }
};

const updateTicketDeparture = async (id, departure, handleError) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(id, {
      departureTime: new Date(departure.time),
      departureStatus: departure.status,
    });
    return ticket;
  } catch (error) {
    handleError(error);
  }
};

module.exports = { updateTicketArrival, updateTicketDeparture, updateTicketStatus };
