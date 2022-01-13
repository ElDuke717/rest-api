'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');
//const { Course } = require('../models');

exports.authenticate = async (req, res, next) => {
    let message;
    const credentials = auth(req);
    console.log(credentials);
    if (credentials) {
        const user = await User.findOne({ where: {username: credentials.email} });
        if (user) {
            const authenicated = bcrypt
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



