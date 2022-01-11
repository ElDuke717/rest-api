'use strict'

const express = require('express');
require('log-timestamp');

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
        // got this code snippet from Slack where someone else was running into the same issue.  I also had to
        // research an Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client 
        //that was occuring, which adding 'return' fixed.
        return res.status(201).location("/").end();
    } catch (error) {
        console.log(error.errors);
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

//Route that returns a corresponding course including the user.
router.get("/courses/:id", asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id); //req.params.id contains the book's unique id number
    if (course) {
      res.json(course);
    } else {
      res.sendStatus(404);
      console.log('course not found');
    }
  }));

  //POST route that creates a new course, sets the location header to the URI for the new course and returns
  //a 201 HTTP status code.

router.post('/courses', asyncHandler(async(req, res) => {
    try {
        const course = await Course.create(req.body);
        console.log('course was created');
        return res.status(201).location("/courses/" + course.id).end();
    } catch (error) {
       
        console.log('ERROR', error.name);
        console.log('ignoramous');
        console.log(error);
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
}))


module.exports = router;