// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');

const wsServer = new ws.Server({ noServer: true });
const clients = new Map();

const authenticate = async (token) => {
  const decodedToken = await jwt.verify(token, process.env.SECRET_KEY);
  return decodedToken != null;
};
const acceptMessage = (id, msg) => {
  const messageJSON = JSON.parse(msg);
  const metadata = clients.get(id);
  if (msg.type === 'auth') {
    metadata.authenticated = authenticate(msg.token);
    return;
  }

  // only allow messages if authenticated
  if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    const outbound = JSON.stringify(messageJSON);
    [...clients.keys()].forEach((client) => {
      client.send(outbound);
    });
  }
};

wsServer.on('connection', (socket, request) => {
  const id = uniqid();
  const metadata = { id, userId: request.decodedToken.id };
  clients.set(socket, metadata);

  socket.on('message', (msg) => {
    acceptMessage(id, msg);
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

module.exports = wsServer;
