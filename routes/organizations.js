const router = require('express').Router();
const bcrypt = require('bcrypt');
const Organization = require('../data/models/organization');
const User = require('../data/models/user');
const tokenValidator = require('../utils/tokenValidation');
const ticketsRouter = require('./tickets');

router.use('/:orgId/tickets', ticketsRouter);
router.get('/', async (req, res, next) => {
  try {
    const organizations = await Organization.find({}).populate('owner', { username: 1 });
    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    res.json(organization);
  } catch (error) {
    next(error);
  }
});

router.post('/', tokenValidator, async (req, res, next) => {
  const { passkey, name } = req.body;
  try {
    const pwHash = await bcrypt.hash(passkey, 10);
    const org = new Organization({
      name,
      passwordHash: pwHash,
      owner: req.decodedToken.id,
      members: [],
      tickets: [],
    });
    const savedOrg = await org.save();
    const user = await User.findById(req.decodedToken.id);
    user.organizations = user.organizations.concat({
      role: 'OWNER',
      orgId: savedOrg.id,
    });
    await user.save();
    res.status(201).json(savedOrg);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/users', tokenValidator, async (req, res, next) => {
  const { passkey } = req.body;
  try {
    const user = await User.findById(req.decodedToken.id);
    const org = await Organization.findById(req.params.id);
    const pwCorrect = await bcrypt.compare(org.passwordHash, passkey);
    const alreadyOrganization = user.organizations.includes(
      (organization) => organization.id === req.params.id,
    );
    if (pwCorrect && !alreadyOrganization) {
      org.members = [...org.members, user.id];
      user.organizations = [...user.organizations, org.id];
      await org.save();
      const savedUser = await user.save();
      res.status(201).json(savedUser.populate('organizations'));
    } else if (!pwCorrect) {
      next({
        name: 'AuthError',
        message: 'Invalid organization passkey',
      });
    } else {
      next({
        name: 'CustomError',
        message: 'organization already added',
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
