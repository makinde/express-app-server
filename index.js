#!/usr/bin/env node

const logger = require('morgan');
const forceSSL = require('express-force-ssl');
const http = require('http');
const debug = require('debug')('express-runner');
const app = require('./');

const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT, 10) || 4000;

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

app.use(logger('dev'));
if (isProd) {
  app.set('forceSSLOptions', { trustXFPHeader: true });
  app.use(forceSSL);
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  debug('listening');
  if (process.send) process.send('online'); // for browser refresh
});
server.on('error', onError);
server.on('listening', onListening);
