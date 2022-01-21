'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// exports.authenticate allows the authenticate function to be exported to other modules
exports.authenticate = async (req, res, next) => {
    let message; // initiate message to display
    // Auth parses the user's credentials from the Authorization header - Credentials name and password
    const credentials = auth(req);
    console.log(credentials);
    // If there are credentials, retreive the user from the datastore by their username - in this case email 
    // pulled by auth from the authorization header.
    if (credentials) {
        // const user is the instance in the database that has an email address that matches the credentials.name
        const user = await User.findOne({ where: {emailAddress: credentials.name} });
        // if a user instance that matches the credentials is found, then the password is authenticated.
        if (user) {
            // The compareSync method is used to compare the hashed password from the credentials.name with
            // the password that has already been hashed. 
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
                if (authenticated) {
                    console.log(`Authentication successful for username: ${user.username}`);
            
                    // Store the user on the Request object.
                    req.currentUser = user;
                  } else {
                    message = `Authentication failure for username: ${user.username}`;
                  }
                } else {
                  message = `User not found for username: ${credentials.name}`;
                }
              } else {
                message = 'Auth header not found';
              }
            
              // If user authentication failed...
              // Return a response with a 401 Unauthorized HTTP status code.
              if (message) {
                console.warn(message);
                res.status(401).json({ message: 'Access Denied' });
              // Or if user authentication succeeded...
                // Call the next() method.
              } else {
    next();
    }
};



