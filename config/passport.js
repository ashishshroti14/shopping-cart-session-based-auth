var passport = require('passport');

var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser((id,done) => {
    User.findById(id, (err,user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({min : 4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error => {
            messages.push(error.msg);
        }));
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, (err,user) => {
        if (err) {
            console.log(err);
            return done(err);
        }
        if (user) {
            var messages = [];
            messages.push('Email aready taken')
            return done(null, false, req.flash('error', messages) );
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
            if (err) {

                console.log(err, 'errrr');
                return done(err);
               
            }
            console.log ('hi');
            return done(null, newUser);
        });

    })
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error => {
            messages.push(error.msg);
        }));
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, (err,user) => {
        if (err) {
            console.log(err);
            return done(err);
        }
        if (!user) {
            var messages = [];
            messages.push('No user found')
            return done(null, false, req.flash('error', messages) );
        }
        if(!(user.validPassword(password))){
            var messages = [];
            messages.push('Wrong Password')
            return done(null, false, req.flash('error', messages) );
        }
        
            return done(null, user);
        });

    })
    

)

