const Ticket = require('../data/models/ticket');

const updateTicketArrival = async (id, arrival, handleError) => {
  try {
    return await Ticket.findByIdAndUpdate(
      id,
      { arrival: new Date(arrival) },
      { new: true },
    );
  } catch (error) {
    return handleError(error);
  }
};

const updateTicketStatus = async (id, active, handleError) => {
  try {
    return await Ticket.findByIdAndUpdate(
      id,
      { active },
      { new: true },
    );
  } catch (error) {
    return handleError(error);
  }
};

const updateTicketDeparture = async (id, departure, handleError) => {
  try {
    return await Ticket.findByIdAndUpdate(
      id,
      {
        departureTime: new Date(departure.time),
        departureStatus: departure.status,
        active: false,
      },
      { new: true },
    );
  } catch (error) {
    return handleError({
      type: 'default',
      message: error.message,
    });
  }
};

module.exports = { updateTicketArrival, updateTicketDeparture, updateTicketStatus };
