const crypto = require('crypto');
const Op = require('sequelize').Op;
const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sendgripdTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgripdTransport({
   auth: {
      api_key: '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'
   }
}));

exports.getRegister = (req,res,next) => {
   res.render('auth/register', {
      path: '/register',
      pageTitle: 'Signup',
      errorMessage: '',
      oldInput: {
         firstName: '',
         lastName: '',
         email: '',
         password: '',
         confirmPassword: ''
      },
      validationErrors: []
   });
};

exports.postRegister = (req,res,next) => {
   const firstName = req.body.firstName;
   const lastName = req.body.lastName;
   const email = req.body.email;
   const password = req.body.password;
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
      return res.status(422).render('auth/register', {
         path: '/register',
         pageTitle: 'Signup',
         errorMessage: errors.array()[0].msg,
         oldInput: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: req.body.confirmPassword
         },
         validationErrors: errors.array()
      });
   }
   bcrypt.hash(password, 12)
   .then(hashedPassword => {
      return User.create({
         firstName: firstName,
         lastName: lastName,
         email: email,
         password: hashedPassword
      })
      .then(result => {
         res.redirect('/login')
         return transporter.sendMail({
            to: email,
            from: 'raysonlinestore.com',
            subject: 'Signed up secceeded!',
            html: `<h1>Thank you ${firstName} for signing up!</h1>`
         })
      })
      .catch(err => console.log(err));
   })
   .catch(err => console.log(err));
}

exports.getLogin = (req,res,next) => {
   res.render('auth/login', {
      pageTitle: 'login',
      path: '/login',
      errorMessage: '',
      oldInput: {
         email: '',
         password: '',
      },
      validationErrors: []
   })
};

exports.postLogin = (req,res,next) => {
   const email = req.body.email;
   const password = req.body.password;
   const errors = validationResult(req);

   if(!errors.isEmpty()) {
      return res.status(422).render('auth/login', {
         pageTitle: 'login',
         path: '/login',
         errorMessage: errors.array()[0].msg,
         oldInput: {
            email: email,
            password: password,
         },
         validationErrors: errors.array()
      })
   }

   User.findOne({ where: { email: email } })
      .then(user => {
         if(!user) {
            return res.status(422).render('auth/login', {
               pageTitle: 'login',
               path: '/login',
               errorMessage: 'Invalid email or password',
               oldInput: {
                  email: email,
                  password: password,
               },
               validationErrors: []
            })
         }
         bcrypt.compare(password, user.password)
            .then(doMatch => {
               if(doMatch) {
                  req.session.isLoggedIn = true;
                  req.session.user = user;
                  return req.session.save(result => {
                     res.redirect('/products');
                  })
               }
               return res.status(422).render('auth/login', {
                  pageTitle: 'login',
                  path: '/login',
                  errorMessage: 'Invalid email or password',
                  oldInput: {
                     email: email,
                     password: password,
                  },
                  validationErrors: []
               })
            })
            .catch(err => {
               console.log('2',err);
               res.redirect('/login');
            })
      })
      .catch(err => console.log('3',err));
};


// stil have to fix. session is still in the database after logging out
exports.postLogout = (req,res,next) => {
   req.session.destroy(err => {
      if(err) {
         console.log(err);
      } else {
         console.log('ok');
         res.redirect('/');
      }
   });
};

exports.getResetPassword = (req,res,next) => {
   res.render('auth/reset-password', {
      pageTitle: 'Reset Password',
      path: '/reset-password'
   })
};

exports.postResetPassword = (req,res,next) => {
   const email = req.body.email;
   crypto.randomBytes(32, (err,buffer) => {
      if(err) {
         console.log(err);
         res.redirect('/reset-password');
      }
      const token = buffer.toString('hex');
      User.findOne({where: {email: email}})
         .then(user => {
            if(!user) {
               return res.redirect('reset-password')
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; //this is one hour;
            return user.save();
         })
         .then(result => {
            res.redirect('/');
            transporter.sendMail({
               to: email,
               from: 'rayonlinestore.com',
               subject: 'Password reset',
               html: `
                  <p>You requested a password reset</p>
                  <p>Click this <a href="http://localhost:8080/new-password/${token}">link</a> to set a new password</p>

               `
            })
         })
         .catch(err => console.log(err));
   })
};

exports.getNewPassword = (req,res,next) => {
   const token = req.params.token;
   User.findOne({ where: {
      [Op.and]: [{resetToken: token}, {resetTokenExpiration: {[Op.gt]: Date.now()} }]
   }})
   .then(user => {
      res.render('auth/new-password', {
         pageTitle: 'New Password',
         path: '/new-password',
         userId: user.id,
         passwordToken: token
      })
   })
   .catch(err => console.log(err));
};

exports.postNewPassword = (req,res,next) => {
   const userId = req.body.userId;
   const password = req.body.password;
   const passwordToken = req.body.passwordToken;
   User.findOne({where: { 
      [Op.and]: [{ resetToken: passwordToken }, { resetTokenExpiration: {[Op.gt]: Date.now()}}, { id: userId }]
   }})
      .then(user => {
         if(!user) {
            return redirect('/')
         }
         bcrypt.hash(password, 12)
            .then(hashedPassword => {
               user.password = hashedPassword;
               console.log(user.resetToken)
               user.resetToken = null;
               user.resetTokenExpiration = null;
               return user.save();
            })
            .then(result => {
               console.log('Password has been reset');
               res.redirect('/login');
            })
            .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
};