const Ticket = require('../data/models/ticket');
const webSocketServer = require('./websocket');

const startWatch = () => {
  Ticket.watch().on('change', (data) => {
    webSocketServer.emit('new ticket', data.fullDocument);
  });
};

module.exports = startWatch;
