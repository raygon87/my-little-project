const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');
const { check, body } = require('express-validator/check');
const User = require('../models/user');

router.get('/register', authController.getRegister);

router.post('/register', 
   [
      body('firstName')
         .trim()
         .not().isEmpty()
         .withMessage('First name is required'),
      body('lastName')
         .trim()
         .not().isEmpty()
         .withMessage('Last name is required'),
      body('email')
         .trim()
         .isEmail()
         .withMessage('Please enter a valid email address')
         .normalizeEmail()
         .custom((value, {req}) => {
            return User.findOne({where: {email: value}})
            .then(user => {
               if(user) {
                  return Promise.reject('That email is already taken');
               }
            })
         }),
      body('password')
         .trim()
         .isLength({min:7})
         .withMessage('Password must to be atleast 7 characters long'),
      body('confirmPassword')
         .trim()
         .custom((value, { req }) => {
            if(value !== req.body.password) {
               throw new Error('Passwords have to match!');
            }
            return true;
         })
   ]
   ,authController.postRegister
);

router.get('/login', authController.getLogin);
router.post('/login', 
   [
      body('email')
         .isEmail()
         .withMessage('Please enter a valid email address')
         .normalizeEmail(),
      body('password')
         .isLength({min:7})
         .withMessage('Password must be atleast 7 characters long')
         .trim()
   ]
,authController.postLogin);

router.post('/logout', isAuth, authController.postLogout);

router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password/', authController.postResetPassword);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;