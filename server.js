const { createServer } = require('http');
const { app } = require('./lib/router');

const server = createServer();
server.on('request', (req, res) => {
  try {
    app.serve(req, res);
  } catch (err) {
    console.error(err);
  }
});

server.on('error', err => console.log('error occured in server', err));

server.listen(process.argv[2], () =>
  console.log(`server is listening to port :`, server.address().port)
);
