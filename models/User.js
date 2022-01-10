'use strict';

const { Model, DataTypes } = require('sequelize');
// Leaving bcrypt requirement/import in case we may need it later - see confirmedPassword from latest module to enable.
// const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A first name is required'
              },
              notEmpty: {
                msg: 'Please provide a first name'
              }
            }
          },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A last name is required'
              },
              notEmpty: {
                msg: 'Please provide a last name'
              }
            }
          },
          emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
              msg: 'The email you entered already exists',
            },
            validate: {
              notNull: {
                msg: 'An e-mail is required',
              },
              isEmail: {
                msg: 'Please provide a valid email address',
              },
            },
          },
          password: {
            type: DataTypes.STRING, 
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A password is required',
              },
              notEmpty: {
                msg: 'Please provide a password',
              },
              // We may or may not want to include this requirement -  the length of the password.
              len: {
                args: [8, 20],
                msg: 'The password must be between 8 and 20 characters in length',
              }
            }
          },
          // We may want to include a confirmedPassword property here.
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            as: 'user',
            foreignKey:{
                fieldName: 'userId',
                allowNull: false,
            },
        });
    };
    return User;
};