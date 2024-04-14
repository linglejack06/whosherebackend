const Ticket = require('../data/models/ticket');
const User = require('../data/models/user');
const Organization = require('../data/models/organization');

const createTicket = async (metadata, fields, handleError) => {
  try {
    const {
      departureDate, arrival, orgId, departureStatus,
    } = fields;
    const ticket = new Ticket({
      organization: orgId,
      user: metadata.userId,
      departureTime: departureDate ? new Date(departureDate) : null,
      departureStatus,
      arrival: new Date(arrival),
      active: !departureDate,
    });
    const savedTicket = await ticket.save();
    // add ticket to user
    const user = await User.findById(metadata.userId);
    user.tickets = user.tickets.concat(savedTicket.id);
    await user.save();

    // add ticket to organization
    const organization = await Organization.findById(orgId);
    organization.tickets = organization.tickets.concat(savedTicket.id);
    await organization.save();
    return ticket;
  } catch (error) {
    handleError(error);
  }
};

module.exports = createTicket;
