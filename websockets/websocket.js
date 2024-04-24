/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const createTicket = require('../utils/createTicket');
const { getActiveTickets, getAllTickets } = require('../utils/getTickets');
const { updateTicketDeparture } = require('../utils/updateTicket');

const wsServer = new ws.Server({ noServer: true });
const clients = new Map();

const authenticate = async (token, metadata, handleError) => {
  try {
    console.log('running auth');
    const decodedToken = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedToken);
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
        handleError({ type: 'AuthError', message: 'Failed to Authenticate' });
      }
      return;
    }
    metadata.authenticated = false;
    handleError({ type: 'AuthError', message: 'Failed to Authenticate' });
  } catch (error) {
    metadata.authenticated = false;
    console.log(error.type);
    handleError({ type: 'AuthError', message: error.name === 'TokenExpiredError' ? 'Logged out due to Inactivity' : error.message });
  }
};
const handleError = (socket, error) => {
  socket.send(JSON.stringify({
    ...error,
    errorType: (error && error.type) ? error.type : 'default',
    type: 'error',
  }));
};

const changeOrganization = async (socket, metadata, messageJSON) => {
  let found = false;
  for (let i = 0; i < metadata.organizations.length; i += 1) {
    if (metadata.organizations[i].equals(messageJSON.fields.organization)) {
      metadata.activeOrganization = metadata.organizations[i];
      found = true;
      break;
    }
  }
  // send the new tickets
  if (found) {
    socket.send(JSON.stringify({
      type: 'all_tickets',
      contents: await getAllTickets(metadata.activeOrganization, (error) => {
        handleError(socket, error);
      }),
    }));
  } else {
    handleError(socket, {
      type: 'operation_fail',
      message: 'requested organization does not exist in user\'s organizations',
    });
  }
};

const acceptMessage = async (socket, msg) => {
  const metadata = clients.get(socket);
  const messageJSON = msg.length !== 0 ? JSON.parse(msg) : {};
  if (!messageJSON.type) {
    handleError(socket, {
      type: 'type_error',
      message: 'No type was provided in message sent to server',
    });
    return;
  }
  if (messageJSON.type === 'auth') {
    await authenticate(
      messageJSON.fields.token,
      metadata,
      (error) => {
        handleError(socket, error);
      },
    );

    if (metadata.authenticated) {
      socket.send(JSON.stringify({
        type: 'all_tickets',
        contents: await getAllTickets(
          metadata.activeOrganization,
          (error) => handleError(socket, error),
        ),
      }));
      socket.send(JSON.stringify({
        ...await User.findById(metadata.userId).populate('organizations.orgId'),
      }));
    }
  } else if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    switch (messageJSON.type) {
      case 'new_ticket':
        socket.send(JSON.stringify({
          type: 'user_ticket',
          contents: await createTicket(
            metadata,
            messageJSON.fields,
            (error) => {
              handleError(socket, error);
            },
          ),
        }));
        return;
      case 'change_active_organization':
        await changeOrganization(socket, metadata, messageJSON);
        return;
      case 'end_ticket':
        await updateTicketDeparture(
          messageJSON.fields.id,
          {
            status: messageJSON.fields.departureStatus,
            time: messageJSON.fields.departureTime,
          },
          (error) => {
            handleError(socket, error);
          },
        );
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
    console.log('connection closed');
  });
});

module.exports = { wsServer, clients };
