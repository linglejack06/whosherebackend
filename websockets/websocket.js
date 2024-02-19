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
      // eslint-disable-next-line prefer-destructuring
      metadata.activeOrganization = metadata.organizations[0];
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
    await authenticate(messageJSON.fields.token, metadata);
    socket.send(metadata.authenticated ? 'Authentication Successful' : 'Authentication Failed');
    return;
  }

  // only allow messages if authenticated
  if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    if (messageJSON.type === 'new ticket') {
      await createTicket(metadata, messageJSON.fields, (error) => {
        socket.send(JSON.stringify(error));
      });
      return;
    }
    if (messageJSON.type === 'change organization') {
      for (let i = 0; i < metadata.organizations.length; i += 1) {
        if (metadata.organizations[i].equals(messageJSON.fields.organization)) {
          metadata.activeOrganization = metadata.organizations[i];
          socket.send(`Successfully changed organization to ${metadata.activeOrganization}`);
          return;
        }
      }
      socket.send('This organization does not exist in your list');
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
