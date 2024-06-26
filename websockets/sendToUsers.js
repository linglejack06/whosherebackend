const Ticket = require('../data/models/ticket');
const sendNotification = require('../utils/notification');

const sendToUsers = async (clients, type, contents) => {
  let ticket;
  if (type !== 'delete_ticket') {
    ticket = await Ticket.findById(contents.id).populate('user', { firstName: 1, lastName: 1 }).lean();
  } else {
    ticket = contents;
  }
  [...clients.keys()].forEach((client) => {
    const metadata = clients.get(client);
    if (metadata.authenticated && metadata.activeOrganization.equals(ticket.organization)) {
      client.send(JSON.stringify({ type, contents: { ...ticket, id: ticket._id } }));
      if (type !== 'delete_ticket' && metadata.activeTicket) {
        sendNotification(metadata, `${ticket.user.firstName} ${ticket.user.lastName} has ${type === 'add_ticket' ? 'started a ticket' : 'finished a ticket'} }`);
      }
    } else if (metadata.authenticated) {
      client.send(JSON.stringify({ type, contents: ticket }));
    }
  });
};

module.exports = sendToUsers;
