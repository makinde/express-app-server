require('engine-strict').check(); // Check node version ASAP
require('dotenv').load(); // and get the environment set up

const compression = require('compression');
const helmet = require('helmet');
const logger = require('morgan');
const expressEnforcesSSL = require('express-enforces-ssl');
const express = require('express');
const http = require('http');
const path = require('path');
const program = require('commander');

// Determine where to get the express app and initialization script from
const currentDir = process.cwd();
program
  .option('-i, -init <initScript>', 'Initialization script')
  .option('-app <appScript>', 'Script to provide the app to serve', '');
program.parse(process.argv);

if (program.init) {
  const initPath = path.join(currentDir, program.init);
  const initFunc = require(initPath); // eslint-disable-line
  initFunc();
}

const appPath = path.join(currentDir, program.app);
const appPromise = require(appPath); // eslint-disable-line

const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT, 10) || 4000;

// Try to resolve to app, in case it returned a promise of an app instead of
// an actual express app. This is useful in the dev startup process for
// next apps. See `app.prepare()` here:
// https://www.npmjs.com/package/next#custom-server-and-routing
Promise.resolve(appPromise).then((hostedApp) => {
  const masterApp = express();
  masterApp.use(
    helmet(),
    logger('dev'),
    compression(),
  );
  if (isProd) {
    masterApp.enable('trust proxy');
    masterApp.use(expressEnforcesSSL());
  }
  masterApp.use(hostedApp);

  const server = http.createServer(masterApp);

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
  }

  /**
 * Event listener for HTTP server "listening" event.
 */
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? `pipe ${addr}`
      : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
  }

  /**
 * Listen on provided port, on all network interfaces.
 */
  server.listen(port, () => {
    if (process.send) process.send('online'); // for browser refresh
  });
  server.on('error', onError);
  server.on('listening', onListening);
});
