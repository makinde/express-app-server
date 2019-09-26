# express-app-server
A production ready script to start up an express app.

## Motivation
When building lots of express apps, there's boilerplate around serving the express app. Compressions, Forcing HTTPS, and so forth. This module takes an express app that defines all of the things specific to your application, and servers it via HTTP(S) so you don't have to duplicate all the simple steps every time.

## Installation

```bash
npm i express-app-server
```

## Usage

In your `package.json` file, add:
```
"scripts" : {
  "start": "node express-app-server"
}
```

Now running `npm start` will start an express server with the app exported in the `index.js` file in directory where the command is run.

The index file can also return a promise for an app. This is useful when serving [`next.js` apps with a custom server](https://www.npmjs.com/package/next#custom-server-and-routing).

## Options

Pass the path to your express app as the "--app" argument. You can also specify an init script that will run before any other code. This is useful for instrumentation. Example:

```bash
node express-app-server --app ../apps/app.js --init setupMonitoring.js
```

You can also specify which script to launch by setting the `main` flag in your package.json.

```js
"main": "../apps/app.js",
```