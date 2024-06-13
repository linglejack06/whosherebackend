const User = require('../data/models/user');
const Organization = require('../data/models/organization');

const changeActiveOrganization = async (userId, newId, handleError) => {
  try {
    const user = await User.findById(userId).populate('tickets');
    const organization = await Organization.findById(newId);
    if (organization) {
      user.activeOrganization = organization.id;
    } else {
      handleError({ message: 'Not found' });
      return null;
    }
    await user.save();
    const userToSend = await User.findById(userId).populate('activeOrganization').populate('tickets').lean();
    const activeTicket = userToSend.tickets.find((t) => t.departureTime === null);
    return {
      ...userToSend,
      activeTicket: activeTicket || null,
    };
  } catch (error) {
    handleError(error);
  }
};

module.exports = changeActiveOrganization;
