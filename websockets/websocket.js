/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const createTicket = require('../utils/createTicket');

const wsServer = new ws.Server({ noServer: true });
const clients = new Map();

const authenticate = async (token, metadata) => {
  const decodedToken = await jwt.verify(token, process.env.SECRET_KEY);
  if (decodedToken != null) {
    const user = await User.findById(decodedToken.id);
    if (user) {
      metadata.authenticated = true;
      metadata.userId = user.id;
      metadata.organizations = user.organizations.map((org) => org.orgId);
    } else {
      metadata.authenticated = false;
    }
    return;
  }
  metadata.authenticated = false;
};
const acceptMessage = async (socket, msg) => {
  const metadata = clients.get(socket);
  const messageJSON = JSON.parse(msg);
  if (!messageJSON.type) {
    socket.send('Error');
    return;
  }
  if (messageJSON.type === 'auth') {
    await authenticate(messageJSON.token, metadata);
  }

  // only allow messages if authenticated
  if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    console.log(messageJSON);
    if (messageJSON.type === 'new ticket') {
      console.log('ticket post');
      await createTicket(metadata, messageJSON.fields, (error) => {
        socket.send(JSON.stringify(error));
      });
    } else {
      const outbound = JSON.stringify(messageJSON);
      [...clients.keys()].forEach((client) => {
        client.send(outbound);
      });
    }
  }
};

wsServer.on('connection', (socket) => {
  const id = uniqid();
  const metadata = { id };
  clients.set(socket, metadata);

  socket.on('message', (msg) => {
    acceptMessage(socket, msg);
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

module.exports = { wsServer, clients };
