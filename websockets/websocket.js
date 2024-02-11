// eslint-disable-next-line import/no-extraneous-dependencies
const ws = require('ws');
const uniqid = require('uniqid');

const wsServer = new ws.Server({ noServer: true });
const clients = new Map();

const acceptMessage = (socket, msg) => {
  const messageJSON = JSON.parse(msg);
  const metadata = clients.get(socket);
  messageJSON.sender = metadata.id;
  const outbound = JSON.stringify(messageJSON);
  [...clients.keys()].forEach((client) => {
    client.send(outbound);
  });
};
wsServer.on('connection', (socket) => {
  const id = uniqid();
  const metadata = { id };
  clients.set(socket, metadata);
  console.log('client connected');

  socket.on('message', (msg) => {
    acceptMessage(socket, msg);
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

module.exports = wsServer;
