const { app } = require('./lib/router');

const port = 3000;
app.listen(port, () => console.log('server is listening', port));
