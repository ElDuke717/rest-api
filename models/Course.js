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
        //  Minimum data required are just title and description - null values are allowed for estimatedTime and materialsNeeded.
        estimatedTime: {
            type: DataTypes.STRING,
        },
        materialsNeeded: {
            type: DataTypes.STRING,
        },
        
        // userId - defined in the associations and is not included as part of the model's fields
        // reference here one-to-many relationships https://sequelize.org/master/manual/assocs.html#one-to-many-relationships
    }, { sequelize });
    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            // Note that these parameters are used in the routes to cross-reference this model's association
            as: 'user',
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
            },
        });
    };

    return Course;
}

