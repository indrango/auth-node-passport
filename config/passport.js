//load package
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//Load up model
var User = require('../app/models/user');

//LOad the auth vairiabel
var configAuth = require('./auth');

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

  //===== LOCAL SIGNUP =====//

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
    function(req, email, password, done) {
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

  //===== FACEBOOK =====//
  passport.use(new FacebookStrategy({
    //Pull id and secret from auth.js
    clientID      : configAuth.facebookAuth.clientID,
    clientSecret  : configAuth.facebookAuth.clientSecret,
    callbackURL   : configAuth.facebookAuth.callbackURL,
    passReqToCallback : true
  },
  //Facebook will send back the token and profile
  function(req, token, refreshToken, profile, done) {
    //Asynchronous
    process.nextTick(function() {

      //Check if the user is already loged in
      if (!req.user) {
        //Find the user in database on their facebook id
        User.findOne({'facebook.id' : profile.id}, function(err, user) {
          if (err) {
            return done(err);
          }
          //If the user is found, then log them in
          if (user) {

            //if there is a user id already but no token
            //Just add our token and profile information
            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = profile.emails[0].value;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }

            return done(null, user);
          } else {
            //If there is no user found with that fb id, crate new
            var newUser = User();

            //set all fb information
            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;

            //Save to our database
            newUser.save(function(err) {
              if(err) {
                throw err;
              }
              return done(null, newUser);
            });

          }

        });
      } else {
        //User already exist and is logged in, we have to link accounts
        var user = req.user; //Pull the user out of the session

        //Update the current users facebook credentials
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = profile.emails[0].value;

        //Save the user
        user.save(function(err) {
          if (err)
            throw err;

          return done(null, user);
        });
      }
    });
  }));

//===== TWITTER =====//
passport.use(new TwitterStrategy({
  consumerKey     : configAuth.twitterAuth.consumerKey,
  consumerSecret  : configAuth.twitterAuth.consumerSecret,
  callbackURL     : configAuth.twitterAuth.callbackURL,
  passReqToCallback : true
},
function(req, token, tokenSecret, profile, done) {
  process.nextTick(function() {
    //Check if the user is already login
    if (!req.user) {
      User.findOne({'twitter.id' : profile.id}, function(err, user) {
        //If error stop everything
        if (err)
          return done(err);

        //If the user found then log them in
        if (user) {
          //if there is a user id already but no token
          //Just add our token and profile information
          if (!user.twitter.token) {
            user.twitter.token = token;
            user.twitter.username = profile.username;
            user.twitter.displayName = profile.displayName;

            user.save(function(err) {
              if (err)
                throw err;
              return done(null, user);
            });
          }
          return done(null, user); //User found, return that user

        } else {
          //if there is no user, create them
          var newUser = new User();

          //Set all data
          newUser.twitter.id = profile.id;
          newUser.twitter.token = token;
          newUser.twitter.username = profile.username;
          newUser.twitter.displayName = profile.displayName;

          newUser.save(function(err) {
            if (err)
              throw err;

            return done(null, newUser);
          });
        }
      });
    }else {
      //User already exist and is logged in, we have to link accounts
      var user = req.user;

      user.twitter.id = profile.id;
      user.twitter.token = token;
      user.twitter.username = profile.username;
      user.twitter.displayName = profile.displayName;

      user.save(function(err) {
        if (err)
          throw err;

        return done(null, user);
      });
    }
  });
}));

//===== GOOGLE =====//
passport.use(new GoogleStrategy({
  clientID        : configAuth.googleAuth.clientID,
  clientSecret    : configAuth.googleAuth.clientSecret,
  callbackURL     : configAuth.googleAuth.callbackURL,
  passReqToCallback : true
},
function(req, token, refreshToken, profile, done) {
  //Make the code Asynchronous
  process.nextTick(function() {
    //Check if the user is already logged in
    if (!req.user) {
      User.findOne({'google.id': profile.id}, function(err, user) {
        if (err)
          return done(err);

        if (user) {
          //if there is a user id already but no token
          //Just add our token and profile information
          if (!user.twitter.token) {
            user.twitter.token = token;
            user.twitter.name = profile.dispalyname;
            user.twitter.email = profile.emails[0].value;

            user.save(function(err) {
              if (err)
                throw err;
              return done(null, user);
            });
          }
          //If user is round, log them in
          return done(null, user);
        }else {
          //If the user isnt in database, create new
          var newUser = new User();

          newUser.google.id = profile.id;
          newUser.google.token = token;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value;

          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    }else {
      //User already exist and is logged in, we have to link accounts
      var user = req.user;

      user.google.id = profile.id;
      user.google.token = token;
      user.google.name = profile.displayName;
      user.google.email = profile.emails[0].value;

      user.save(function(err) {
        if (err)
          throw err;

        return done(null, user);
      });
    }
  });
}));


};
