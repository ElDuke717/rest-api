'use strict';

const Sequelize = require('sequelize');
const routes = require('./routes');
require('log-timestamp');
const cors = require('cors');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db'
});

//Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

// load modules
const express = require('express');
const morgan = require('morgan');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//enable all CORS requests
app.use(cors());

//Gives express the ability to parse JSON and read req.body
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Re-direct routes app to routes module.
/* The router is imported from the routes module into the app.js file and added to the main application 
using the Express Application use() method, This means that the complete path for the GET and POST 
user routes is /api/users: https://teamtreehouse.com/library/rest-api-validation-with-express-2/the-importance-of-data-validation/review-the-routes */
app.use('/api', routes);


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
