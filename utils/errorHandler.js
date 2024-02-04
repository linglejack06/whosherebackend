// modeled from Full Stack Open Course Part 4
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token' });
  }
  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' });
  }
  if (error.name === 'CustomError') {
    return response.status(401).json({ error: error.message });
  }

  return next(error);
};

module.exports = errorHandler;
