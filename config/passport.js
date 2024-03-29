// var config = require('../db-config.js');

// read .env file config
require('dotenv').config();

// Code below for testing in production

var config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
}

var mysql = require('mysql');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')

config.connectionLimit = 10;
var connection = mysql.createPool(config);

const saltRounds = 10;

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
      done(null, user.account_id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
      connection.query("SELECT * FROM Account WHERE account_id = ? ",[id], function(err, rows){
          done(err, rows[0]);
      });
  });

  // Register
  passport.use(
    'local-register',
    new LocalStrategy({
      usernameField: 'email'
    },
    function(email, password, done) {

      // match user
      var query = `
        SELECT *
        FROM Account
        WHERE email = ?;
      `;
      connection.query(query, [email], function(err, rows, fields) {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (rows.length) {
          // email found in db (user already exists)
          return done(null, false, { message: 'user already exists'});
        } else {
          //register user

          // hash password
          bcrypt.hash(password, saltRounds, function(err, hash) {
              // Store hash in your password DB.
              var newUser = {
                email: email,
                password: hash
              }

              var insertQuery = `
                INSERT INTO Account (email, password)
                VALUES (?, ?);
              `;
              connection.query(insertQuery, [newUser.email, newUser.password], function(err, rows, fields) {
                if (err) console.log(err);
                else {
                  return done(null, newUser);
                }
              });

          });

        }
      });

    }
  )
  );

  // login
  passport.use(
    'local-login',
    new LocalStrategy({
      usernameField: 'email'
    },
    function(email, password, done) {
      var query = `
        SELECT *
        FROM Account
        WHERE email = ?;
      `;
      connection.query(query, [email], function(err, rows, fields) {
        if (err) {
          return done(err);
        }

        // email doesn't exist
        if (!rows.length) {
          return done(null, false, {message: 'no user found with that email'});
        }

        bcrypt.compare(password, rows[0].password, function(err, result) {
          // incorrect password
          if (!result) {
            return done(null, false, {message: 'incorrect password'});
          }

          // correct password
          return done(null, rows[0]);

        })

      });
    }
  )
  )

}
