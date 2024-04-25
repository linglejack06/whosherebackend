const User = require('../data/models/user');

const changeActiveOrganization = async (userId, newId, handleError) => {
  try {
    const user = await User.findById(userId);
    user.activeOrganization = newId;
    await user.save();
    return user;
  } catch (error) {
    handleError(error);
  }
};

module.exports = changeActiveOrganization;
