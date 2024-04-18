// modeled from Full Stack Open Course Part 4
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ type: 'IDError', message: error.message });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ type: 'ValidationError', message: error.message });
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ type: 'AuthError', message: error.message });
  }
  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ type: 'AuthError', message: error.message });
  }
  if (error.name === 'AuthError') {
    return response.status(401).json({ type: 'AuthError', message: error.message });
  }
  if (error.name === 'CustomError') {
    return response.status(401).json({ type: 'default', message: error.message });
  }

  return response.status(401).json({ type: 'default', message: error.message });
};

module.exports = errorHandler;
