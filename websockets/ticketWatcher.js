/* eslint-disable no-underscore-dangle */
const Ticket = require('../data/models/ticket');
const { clients } = require('./websocket');
const sendNotification = require('../utils/notification');

const startWatch = () => {
  Ticket.watch().on('change', async (data) => {
    [...clients.keys()].forEach((client) => {
      const metadata = clients.get(client);
      const { fullDocument, operationType } = data;
      fullDocument.id = fullDocument._id;
      delete fullDocument._id;
      delete fullDocument.__v;
      if (metadata.authenticated) {
        if (metadata.activeOrganization.equals(fullDocument.organization)) {
          if (operationType === 'update') {
            client.send(JSON.stringify({ type: 'update', contents: data.updateDescription.updatedFields }));
            sendNotification(metadata, data.updateDescription.updatedFields);
          } else if (operationType === 'insert') {
            client.send(JSON.stringify({ type: 'insert', contents: fullDocument }));
          }
        }
      }
    });
  });
};

module.exports = startWatch;
