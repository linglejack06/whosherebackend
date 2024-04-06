const jwt = require('jsonwebtoken');

const tokenValidation = async (req, res, next) => {
  try {
    const auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer')) {
      const token = auth.replace('Bearer ', '');
      req.decodedToken = await jwt.verify(token, process.env.SECRET_KEY);
      req.token = auth;
      next();
    } else {
      next({
        message: 'no authorization found',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = tokenValidation;
