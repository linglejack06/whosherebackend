/* eslint-disable no-underscore-dangle */
const Ticket = require('../data/models/ticket');
const { clients } = require('./websocket');
const sendNotification = require('../utils/notification');

const startWatch = () => {
  Ticket.watch().on('change', async (data) => {
    const { fullDocument, operationType } = data;
    if (operationType === 'update') {
      console.log('finished data: ', data);
    }
    let ticket = null;
    if (fullDocument) {
      if (operationType === 'insert') {
        ticket = {
          ...await Ticket.findById(fullDocument._id).populate('user', { firstName: 1, lastName: 1 }),
          id: fullDocument._id,
        };
      } else if (operationType === 'update') {
        ticket = {
          ...await Ticket.findById(data.documentKey._id).populate('user', { firstName: 1, lastName: 1 }),
          id: data.documentKey._id,
        };
      }
    }
    [...clients.keys()].forEach((client) => {
      const metadata = clients.get(client);
      if (metadata.authenticated) {
        console.log('is user part of org: ', metadata.activeOrganization.equals(ticket.organization));
        if (ticket && metadata.activeOrganization.equals(ticket.organization)) {
          if (operationType === 'update') {
            console.log('finished ticket: ', ticket);
            client.send(JSON.stringify({ type: 'finish_ticket', contents: ticket }));
            sendNotification(metadata, ticket);
          } else if (operationType === 'insert') {
            console.log('new ticket: ', ticket);
            client.send(JSON.stringify({ type: 'add_ticket', contents: { ...ticket, id: ticket._id } }));
            sendNotification(metadata, ticket);
          }
        } else if (operationType === 'delete') {
          client.send(JSON.stringify({ type: 'delete_ticket', contents: data.documentKey.id }));
        }
      }
    });
  });
};

module.exports = startWatch;
