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
const acceptMessage = (socket, msg) => {
  const metadata = clients.get(socket);
  if (!msg.type) {
    socket.send('Error');
    return;
  }
  const messageJSON = JSON.parse(msg);
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

wsServer.on('connection', (socket) => {
  const id = uniqid();
  const metadata = { id };
  clients.set(socket, metadata);

  socket.on('message', (msg) => {
    acceptMessage(socket, msg);
  });

  socket.on('new ticket', (ticket) => {
    [...clients.keys()].forEach((client) => {
      client.send(ticket);
    });
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

module.exports = wsServer;
