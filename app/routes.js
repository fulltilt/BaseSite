var async    = require('async'), // helps with nested callbacks
    crypto   = require('crypto'),
    nodemailer = require('nodemailer'),
    User = require('./models/user');

module.exports = function(app, passport) {
  /* NOTE: When user initially visits the site, logs in and logs out, this whole workflow will be done on the server-side 
     to take advantage of middleware and flash messages. Once user is logged in, everything will work on the client via Angular */
  app.get('/', function(req, res) {
    res.render('index.html');
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form-
  app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.hbs', { message: req.flash('loginMessage') }); 
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/home',  // dummy url that directs to Angular routing
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.hbs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup',  // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // PASSWORD SECTION ====================
  // =====================================
  app.get('/password', isLoggedIn, function(req, res) {
    res.render('password', {
      user : req.user,
      message: req.flash('message')
    });
  });

  // process the password change form
  app.post('/password', passport.authenticate('password', {
    successRedirect : '/home',       // redirect to the secure home section
    failureRedirect : '/password',   // redirect back to the password page if there is an error
    failureFlash : true              // allow flash messages
  }));

  // password reset: http://sahatyalkabov.com/2014/02/26/how-to-implement-password-reset-in-nodejs/
  app.get('/forgot', function(req, res) {
    res.render('forgot.hbs', {
      user : req.user,
      fail : req.flash('fail'),
      success : req.flash('success')
    });
  });

  app.post('/forgot', function(req, res) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ 'local.email' : req.body.email }, function(err, user) {
          if (!user) {
            req.flash('fail', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport('SMTP', {
          service: 'Gmail',
          auth: {
            user: 'notetaker.dummy@outlook.com',
            pass: 'Notetakerdummy1'
          }
        });
        var mailOptions = {
          to: user.local.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  app.get('/reset/:token', function(req, res) {
    User.findOne({
      resetPasswordToken : req.params.token,  // check if there exists a user with a given password reset token
      resetPasswordExpires : { $gt: Date.now() } },  // check token hasn't expired yet
      function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user,
        token: req.params.token
      });
    });
  });

  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({
          resetPasswordToken : req.params.token,
          resetPasswordExpires: { $gt: Date.now() } },
            function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }

            user.local.password = user.generateHash(req.body.pwd1);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport('SMTP', {
          service: 'Gmail',
          auth: {
            user: 'notetaker.dummy@outlook.com',
            pass: 'Notetakerdummy1'
          }
        });
        var mailOptions = {
          to: user.local.email,
          from: 'passwordreset@demo.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err, 'done');
        });
      }
    ], function(err) {
      res.redirect('/home');
    });
  });

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.hbs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // =====================================
  // MISC ==============================
  // =====================================

  // check to see if the user is logged in
  app.get('/api/userData', isLoggedInAjax, function(req, res) {
    return res.json(req.user);
  });

  // route to handle all Angular requests. Ensure that user is logged in before Angular takes over the routing
  app.get('*', isLoggedIn, function(req, res) {
    res.render('../public/partials/index.html');
  });
};

// route middleware to ensure user is logged in - ajax get
function isLoggedInAjax(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.json( { redirect: '/login' } );
  } else {
    next();
  }
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}