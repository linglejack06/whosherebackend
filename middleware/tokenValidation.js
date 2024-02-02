const jwt = require('jsonwebtoken');

const tokenValidation = async (req, res, next) => {
  try {
    let auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer')) {
      auth = auth.replace('Bearer ', '');
      req.decodedToken = await jwt.verify(auth, process.env.SECRET_KEY);
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

module.exports = tokenValidation();
