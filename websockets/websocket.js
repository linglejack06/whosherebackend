/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const User = require('../data/models/user');
const createTicket = require('../utils/createTicket');
const {
  getActiveTickets, getAllTickets, getTicketsFromTime, getUserTickets,
} = require('../utils/getTickets');
const { updateTicketDeparture } = require('../utils/updateTicket');
const changeActiveOrganization = require('../utils/changeActiveOrganization');
const deleteTicket = require('../utils/deleteTicket');
const sendToUsers = require('./sendToUsers');

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
        metadata.activeOrganization = user.activeOrganization
          ? user.activeOrganization
          : metadata.organizations[0];
        metadata.activeTicket = (user.tickets.find((t) => t.departureTime === null)) !== null;
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
  console.error(error);
  socket.send(JSON.stringify({
    ...error,
    errorType: (error && error.type) ? error.type : 'default',
    type: 'error',
  }));
};

const changeOrganization = async (socket, metadata, messageJSON) => {
  const user = await changeActiveOrganization(
    metadata.userId,
    messageJSON.fields.organization,
    (error) => {
      handleError(socket, error);
    },
  );
  if (user) {
    const tickets = await getActiveTickets(messageJSON.fields.organization, (error) => {
      handleError(socket, error);
    });

    socket.send(JSON.stringify({
      type: 'active_tickets',
      contents: tickets,
    }));

    socket.send(JSON.stringify({
      type: 'new_active_organization',
      contents: user,
    }));
  } else {
    handleError(socket, { message: 'Organization not found' });
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

    if (metadata.authenticated && metadata.activeOrganization !== null) {
      socket.send(JSON.stringify({
        type: 'active_tickets',
        contents: await getActiveTickets(
          metadata.activeOrganization,
          (error) => handleError(socket, error),
        ),
      }));
    }
  } else if (metadata.authenticated) {
    messageJSON.sender = metadata.id;
    switch (messageJSON.type) {
      case 'new_ticket':
        const ticket = await createTicket(
          metadata,
          messageJSON.fields,
          (error) => handleError(socket, error),
        );
        if (ticket) {
          metadata.activeTicket = true;
          socket.send(JSON.stringify({
            type: 'user_ticket',
            contents: ticket,
          }));
          await sendToUsers(clients, 'add_ticket', ticket);
        } else {
          console.log('no response');
        }
        return;
      case 'change_active_organization':
        await changeOrganization(socket, metadata, messageJSON);
        return;
      case 'finish_ticket':
        const finishedTicket = await updateTicketDeparture(
          messageJSON.fields.id,
          {
            status: messageJSON.fields.departureStatus,
            time: messageJSON.fields.departureTime,
          },
          (error) => {
            handleError(socket, error);
          },
        );
        metadata.activeTicket = false;
        await sendToUsers(clients, 'finish_ticket', finishedTicket);
        return;
      case 'all_tickets':
        socket.send(JSON.stringify({
          type: 'all_tickets',
          contents: await getTicketsFromTime(
            messageJSON.fields.orgId,
            messageJSON.fields.startTime,
            messageJSON.fields.endTime,
            (error) => handleError(socket, error),
          ),
        }));
        return;
      case 'user_tickets':
        socket.send(JSON.stringify({
          type: 'all_user_tickets',
          contents: await getUserTickets(
            messageJSON.fields.userId,
            (error) => handleError(socket, error),
          ),
        }));
        return;
      case 'delete_ticket':
        const deleted = await deleteTicket(
          messageJSON.fields.id,
          (error) => handleError(socket, error),
        );
        socket.send(JSON.stringify({
          type: 'confirmed_delete_ticket',
          contents: deleted.status,
        }));
        if (deleted.status === 'success') {
          await sendToUsers(clients, 'delete_ticket', deleted.id);
        }
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
