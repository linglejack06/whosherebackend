const Ticket = require('../data/models/ticket');

async function deleteTicket(ticketId, setError) {
  try {
    const deleted = await Ticket.findByIdAndDelete(ticketId);
    if (deleted) {
      return { status: 'success', id: ticketId };
    }
    return { status: 'Fail' };
  } catch (error) {
    setError(error);
    return { status: 'Fail' };
  }
}

module.exports = deleteTicket;
