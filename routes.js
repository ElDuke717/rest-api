'use strict'

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticate } = require('./middleware/authenticate');
const auth = require('basic-auth');
require('log-timestamp');

// Construct a router instance:
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;

//Route that returns a list of the users.
router.get('/users', authenticate, asyncHandler(async (req, res) => {
    try {
    let users = await User.findAll(
        { attributes: 
            { exclude: ['password', 'createdAt', 'updatedAt'] } }
    );
    res.status(200).json(users);
    console.log(users);
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
            console.log(errors);
            res.status(400).json({ errors });   
        }  else {
            throw error;
        }
    }   
}));

//Route that returns a specific user.
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
router.put('/users/:id', authenticate, asyncHandler(async(req, res) => {
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

//Route that returns a list of the courses.
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll(
        { attributes: 
            { exclude: ['password', 'createdAt', 'updatedAt'] } }
    );
    res.json(courses);
}));

//Route that returns a specifc course including the user.
router.get("/courses/:id", asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id,
        { attributes: 
            { exclude: ['password', 'createdAt', 'updatedAt'] } }
        ); //req.params.id contains the book's unique id number
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
    // In order to get authentication to work for PUT and DELETE, we need to match the userId of the course to the user
    // primary key of the user.  We need to make sure that when a course is created, the user's primary key/ id  is used to 
    // populate the userId field for the course.dataValues

    // Once we're able to automatically populate the userId for the course, we can check the id of the user attempting to 
    // PUT or DELETE a route by comparing the course userId with the primary key of the user, then use this logic to allow
    // the process to move forward or respond with a 403 forbidden error.

router.put('/courses/:id', authenticate, asyncHandler(async(req, res) => {
    let course;
    try {
    course = await Course.findByPk(req.params.id);
    const username = auth(req).name;
    console.log('Username: ', username);
    // Find the user in the Users table based on their username/email address.   
    const userDetails = await User.findOne({ where: {emailAddress: username} })
    // Return the user's primary key/id from userDetails
    const userPk = userDetails.dataValues.id
    console.log("Here's the user: ", userPk);
    // course.dataValues.userId will give the existing userId for the course.
    // We need to get the userId from the authorization header to compare with the course.dataValues.userId
    // In order to get the userId for the authenticated user, it has to be pulled from User's database
    // courseAuthor returns the userId for the course. 
    const courseAuthor = course.dataValues.userId
    console.log('Here\'s the courseAuthor: ', courseAuthor);
    // req passed into auth parses out the username and the password from the authorization header on the request.
    if (course) {
        // if the primary key of the authenticated user matches the course's author, then the PUT request will proceed.
        if (userPk === courseAuthor) {
            //Note that course here has to be lowercase as it matches the variable set above, not the Model Course
            //Notice also that req.body is already parsed out with the properties to replace those that are already present.
            await course.update(req.body);
            return res.status(204).location("/").end();
        } else {
            // if the authenticated user and the course author don't match, then a 403 status is returned with a message.
            res.status(403).json({message: "unauthorized user"});
        }
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

//DELETE route to remove courses.  The autthentication pattern here matches the one used for the PUT route above.
router.delete('/courses/:id', authenticate, asyncHandler(async(req, res) => {
    // Find the course based on its id number
    const course = await Course.findByPk(req.params.id);
    // get the username from entered credentials.
    const username = auth(req).name;
    console.log('Username: ', username);
    // find the user's details from the Users table by comparing the username against the emails in the table
    const userDetails = await User.findOne({ where: {emailAddress: username} });
    // pull the user's unique identifying or primary key from the table and assign to userPk
    const userPk = userDetails.dataValues.id
    console.log("Here's the user: ", userPk);
    // Pull the course's userId from the course data and assign to courseAuthor
    const courseAuthor = course.dataValues.userId
    console.log('Here\'s the courseAuthor: ', courseAuthor);
    if  (course) {
        // if the userPk from the authenticated user matches the courseAuthor, then proceed.
        if (userPk === courseAuthor) {
        await course.destroy();
        return res.status(204).location("/").end();
        } else {
        res.status(403).json({message: "unauthorized user"});
        }
    } else {
        res.status(404).json({message:"Course not found."})
    }
}));


module.exports = router;