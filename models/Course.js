'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('.');
const User = require('./User');

// The model for the courses table - belongsTo or associated with one user.
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
        // May need to make the userId populate based on the foreignKey which should be the same as the primary key or id of the user
        // that creates the course
        // userId - defined in the associations, need to determine if this is a field that should come from the User.
        // reference here one-to-many relationships https://sequelize.org/master/manual/assocs.html#one-to-many-relationships
        // userId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        // },

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

