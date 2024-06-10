/* eslint-disable no-underscore-dangle */
const Ticket = require('../data/models/ticket');
const { clients } = require('./websocket');
const sendNotification = require('../utils/notification');

const startWatch = () => {
  Ticket.watch().on('change', async (data) => {
    [...clients.keys()].forEach((client) => {
      const metadata = clients.get(client);
      const { fullDocument, operationType } = data;
      if (fullDocument) {
        fullDocument.id = fullDocument._id;
        delete fullDocument._id;
        delete fullDocument.__v;
      }
      if (metadata.authenticated) {
        if (metadata.activeOrganization.equals(fullDocument.organization)) {
          if (operationType === 'update') {
            client.send(JSON.stringify({ type: 'finish_ticket', contents: fullDocument }));
            sendNotification(metadata, fullDocument);
          } else if (operationType === 'insert') {
            client.send(JSON.stringify({ type: 'add_ticket', contents: fullDocument }));
            sendNotification(metadata, fullDocument);
          } else if (operationType === 'delete') {
            client.send(JSON.stringify({ type: 'delete_ticket', contents: data.documentKey.id }));
          }
        }
      }
    });
  });
};

module.exports = startWatch;
