require('engine-strict').check(); // Check node version ASAP
require('dotenv').load(); // and get the environment set up

const path = require('path');
const program = require('commander');
const helmet = require('helmet');
const logger = require('morgan');
const express = require('express');
const http = require('http');
const { createTerminus } = require('@godaddy/terminus');

// Determine where to get the express app script from
const currentDir = process.cwd();
program
  .option('--app <appScript>', 'Script to provide the app to serve', '');
program.parse(process.argv);

const appPath = path.join(currentDir, program.app);
const appPromise = require(appPath); // eslint-disable-line

const port = parseInt(process.env.PORT, 10) || 4000;

// Try to resolve to app, in case it returned a promise of an app instead of
// an actual express app. This is useful in the dev startup process for
// next apps. See `app.prepare()` here:
// https://www.npmjs.com/package/next#custom-server-and-routing
Promise.resolve(appPromise).then(({
  app: hostedApp, onShutdown = () => {},
}) => {
  const masterApp = express();
  masterApp.use(helmet());
  masterApp.use(logger('dev'));
  masterApp.use(hostedApp);

  const server = http.createServer(masterApp);
  createTerminus(server, {
    timeout: 20000,
    signals: ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection'],
    onShutdown,
  });

  server.listen(port);
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
      ? `Pipe ${port}`
      : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? `pipe ${addr}`
      : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
  });
});
