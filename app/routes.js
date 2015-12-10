//===== Routes ======//
module.exports = function(app, passport) {
  // HOME PAGE (with login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  //LOGIN
  app.get('/login', function(req, res) {
    res.render('login.ejs', {message: req.flash('loginMessage')});
  });

  //process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect :  '/login',
    failureFlash : true
  }));

  //SIGN UP
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {message: req.flash('signupMessage')});
  });

  //Process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  //PROFILE SECTION
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user: req.user
    });
  });

  //===== FACEBOOK ROUTES =====//
  //Route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));
  //Handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }));

  //===== TWITTER ROUTES =====//
  app.get('/auth/twitter', passport.authenticate('twitter'));
  //Handle callback

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect : '/'
    }));

    //====== GOOGLE ROUTES =====//
    app.get('/auth/google', passport.authenticate('google', {scope : ['profile','email']}));

    //The callback after google has authenticated
    app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect : '/'
    }));

  //LOGOUT
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/')
  });

  // AUTHOREIZE (ALREADY LOGED IN/ CONNECTING OTHER SOCIAL ACCOUNT) //
  //Locally
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', {message: req.flash('loginMessage')})
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/connect/local',
    failureFlash : true
  }));

  //Facebook
  //Send to facebook to do the autnehtication
  app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
  //Handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  //Twitter
  //Send twitter to do the authentication
  app.get('/connect/twitter', passport.authorize('twitter', {scope : 'email'}));

  app.get('/connect/facebook/callback',
    passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  //Google
  //Send google to do the authentication
  app.get('/connect/google', passport.authorize('google', {scope : ['profile', 'email']}));

  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

    //===== UNLINK ACCOUNT ======//
    //Local
    app.get('/unlink/local' , function(req, res) {
      var user = req.user;
      user.local.email = undefined;
      user.local.password = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

    //Facebook
    app.get('/unlink/facebook', function(req, res) {
      var user = req.user;
      user.facebook.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

    //Twitter
    app.get('/unlink/twitter', function(req, res) {
      var user = req.user;
      user.twitter.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

    //Google
    app.get('/unlink/google', function(req, res) {
      var user = req.user;
      user.google.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
};



//Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //If usr is authenticated
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
