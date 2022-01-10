'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('.');
const User = require('./User');

module.exports = (sequelize) => {
    class Course extends Model {}
    Course.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A course name is required.',
                },
                notEmpty: {
                    msg: 'Please provide a course name',
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A description is required',
                },
                notEmpty: {
                    msg: 'Please enter a brief description for the course',
                }
            }
        },
        estimatedTime: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please add an estimated time duration for the course',
                },
                notEmpty: {
                    msg: 'Please add an estimated time duration for the course',
                }
            }
        },
        materialsNeeded: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please list the materials needed for the course',
                },
                notEmpty: {
                    msg: 'Please list the materials needed for the course',
                }
            }
        },
        // userId: I'm not sure how to structure this - the instructions and course work are not clear how to do this.
        // reference here one-to-many relationships https://sequelize.org/master/manual/assocs.html#one-to-many-relationships
        //userId: {},

    }, { sequelize });
    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            as: 'user',
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
            },
        });
    };

    return Course;
}

//console.log(Course === sequelize.models.Course);