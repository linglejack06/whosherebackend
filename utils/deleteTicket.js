const Ticket = require('../data/models/ticket');

async function deleteTicket(ticketId, setError) {
  try {
    const deleted = await Ticket.findByIdAndDelete(ticketId);
    if (deleted) {
      return 'Success';
    }
    return 'Fail';
  } catch (error) {
    setError(error);
    return 'Fail';
  }
}

module.exports = deleteTicket;
