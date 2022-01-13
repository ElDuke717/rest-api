'use strict'

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticate } = require('./middleware/authenticate');
require('log-timestamp');

// Construct a router instance:
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;

//Route that returns a list of the users.
router.get('/users', authenticate, asyncHandler(async (req, res) => {
    let users = await User.findAll();
    res.status(200).json(users);
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
        console.log('ERROR: ', error.name);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }   
}));

//Route that returns a corresponding user.
router.get("/users/:id", asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id); //req.params.id contains the users' unique id number
    if (user) {
      res.status(200).json(user);
    } else {
      res.sendStatus(404);
      console.log('User not found');
    }
  }));

// PUT route that will update the corresponding user and return a 204 HTTP status code and no content.
// This was added later and was based on the course PUT route.
router.put('/users/:id', asyncHandler(async(req, res) => {
    try {
    const user = await User.findByPk(req.params.id);
    if (user) {
         await user.update(req.body);
        return res.status(204).location("/").end();
    } else {
        res.status(404).json({message: "User not found."})
    }
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
          } else {
            throw error;
          }
    }
}));

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
      console.log(res.body);
    } else {
      res.sendStatus(404);
      console.log('course not found');
    }
  }));

//POST route that creates a new course, sets the location header to the URI for the new course and returns
//a 201 HTTP status code.
router.post('/courses', authenticate, asyncHandler(async(req, res) => {
    try {
        const course = await Course.create(req.body);
        console.log('course was created');
        return res.status(201).location("/courses/" + course.id).end();
    } catch (error) {
        console.log('ERROR', error.name);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticate, asyncHandler(async(req, res) => {
    //let course;
    try {
    const course = await Course.findByPk(req.params.id);
    if (course) {
            // console.log(course.dataValues);
            // console.log(req.body);
        //Note that course here has to be lowercase as it matches the variable set above, not the Model Course
        //Notice also that req.body is already parsed out with the properties to replace those that are already present.
        await course.update(req.body);
        return res.status(204).location("/").end();
    } else {
        res.status(404).json({message: "Course not found"})
    }
    } catch (error) {
        console.log(error.name);
        if (error.name === "SequelizeValidationError" || error.name === 'SequelizeUniqueConstraintError') {
            //the .build method will build a new model instance in case there is a SequelizeValidationError or SequelizeUniqueConstraintError
            //contrast this with the create method, which will build and save the instance.
            // course = await Course.build(req.body);
            // course.id = req.params.id; //make sure the course gets updated
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
          } else {
            throw error;
          }
    }
}));
//DELETE route to remove courses.
router.delete('/courses/:id', authenticate, asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    if  (course) {
        await course.destroy();
        return res.status(204).location("/").end();
    } else {
        res.status(404).json({message:"Course not found."})
    }
}));


module.exports = router;