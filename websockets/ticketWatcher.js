const Ticket = require('../data/models/ticket');
const { clients } = require('./websocket');

const startWatch = () => {
  Ticket.watch().on('change', (data) => {
    [...clients.keys()].forEach((client) => {
      client.send(JSON.stringify(data.fullDocument));
    });
  });
};

module.exports = startWatch;
