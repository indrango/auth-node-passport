//load package
var LocalStrategy = require('passport-local').Strategy;

//Load up model
var User = require('../app/models/user');

//Expose this function to our app using module.exports
module.exports = function(passport) {
  //Passport session set up//

  //Used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  //Used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //Local Signup //

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    //Asynchronous
    //User.findOne
    process.nextTick(function() {
      User.findOne({'local.email' : email}, function(err, user) {
        //Check if any errors
        if (err) {
          return done(err);
        }
        //Check if theres already user with that email
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          //Create the user
          var newUser = new User();

          //Set the user's local creedentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          //Save the user
          newUser.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
  }));

  //Local login//
  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField :  'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    User.findOne({'local.email' : email}, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('loginMessage','No user found.'));
      }
      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage','Oops! Wrong password.'));
      }
      return done(null, user);
    });
  }));

};
