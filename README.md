# express-app-server
A script to start an express app

## Installation

```bash
npm i express-app-server
```

## Usage

In your `package.json` file, add:
```
"scripts" : {
  "start": "express-app-server"
}
```

Now running `npm start` will start an express server with the app exported in the `index.js` file in directory where the command is run.

## Options

Pass the path to your express app as the first argument. Example:

```bash
npx express-app-server ../apps/app.js
```