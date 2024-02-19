/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const createTicket = require('../utils/createTicket');
const { getActiveTickets, getAllTickets } = require('../utils/getTickets');

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

const changeOrganization = (socket, metadata, messageJSON) => {
  for (let i = 0; i < metadata.organizations.length; i += 1) {
    if (metadata.organizations[i].equals(messageJSON.fields.organization)) {
      metadata.activeOrganization = metadata.organizations[i];
      socket.send(`Successfully changed organization to ${metadata.activeOrganization}`);
      return;
    }
  }
  socket.send('This organization does not exist in your list');
};

const handleError = (socket, error) => {
  socket.send(JSON.stringify(error));
};

const acceptMessage = async (socket, msg) => {
  const metadata = clients.get(socket);
  const messageJSON = JSON.parse(msg);
  if (!messageJSON.type) {
    handleError(socket, {
      type: 'type_error',
      desc: 'No type was provided in message sent to server',
    });
    return;
  }
  if (messageJSON.type === 'auth') {
    await authenticate(messageJSON.fields.token, metadata);
    socket.send(metadata.authenticated
      ? JSON.stringify(
        await getAllTickets(metadata.activeOrganization, (error) => handleError(socket, error)),
      )
      : 'Authentication Failed');
    return;
  }

  // only allow messages if authenticated
  if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    switch (messageJSON.type) {
      case 'new_ticket':
        await createTicket(metadata, messageJSON.fields, (error) => {
          handleError(socket, error);
        });
        return;
      case 'change_organization':
        changeOrganization(socket, metadata, messageJSON);
        return;
      default:
        handleError(socket, {
          type: 'type_error',
          message: 'Unsupported operation type in message',
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
