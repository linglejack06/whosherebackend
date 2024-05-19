const User = require('../data/models/user');
const Organization = require('../data/models/organization');

const changeActiveOrganization = async (userId, newId, handleError) => {
  try {
    const user = await User.findById(userId);
    const organization = Organization.findById(newId);
    if (organization) {
      user.activeOrganization = newId;
    }
    await user.save();
    return user;
  } catch (error) {
    handleError(error);
  }
};

module.exports = changeActiveOrganization;
