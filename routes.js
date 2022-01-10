'use strict'

const express = require('express');

// Construct a router instance:
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;

// Async handler function to wrap around each route.
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (error) {
            // forward to the global error handler
            next(error);
        }
    }
}

//Route that returns a list of the users.
router.get('/users', asyncHandler(async (req, res) => {
    let users = await User.findAll();
    res.json(users);
}));

//Route that creates new users.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).json({"message": "Account successfully created"});
    } catch (error) {
        console.log('ERROR', error.name);
    }

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
));

//Route that gets the courses
router.get('/courses', asyncHandler(async(req, res) => {
    let courses = await Course.findAll();
    res.json(courses);
}))

//Route that returns a list of the courses.
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll();
    res.json(courses);
}));


module.exports = router;