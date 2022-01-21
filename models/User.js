'use strict';

const { Model, DataTypes } = require('sequelize');
//  bcrypt requirement/import is used to hash the password that is submitted.  It is also used to decrypt the password in the authentication process in authenticate.
const bcrypt = require('bcryptjs');

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
            // Unique will cause a SequelizeUniqueConstraintError to be thrown - all other constraints will cause a SequelizeValidationError
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
              },
              //For info on this syntax - see https://sequelize.org/master/manual/getters-setters-virtuals.html#setters
              //A setter is a function defined for one column in the model (password in this case), it allows bcrypt to hash
              //the password before it is even sent to the database.
              set(val) {
                if ( val === this.password ) {
                    const hashedPassword = bcrypt.hashSync(val, 10);
                    this.setDataValue('password', hashedPassword);
                }
              },
            }
          },
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