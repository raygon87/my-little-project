const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');
const { body } = require('express-validator/check');

router.get('/edit-profile', isAuth, userController.getEditUserProfile);
router.post('/edit-profile', isAuth, userController.postEditUserProfile);

router.get('/user/add-product', isAuth, userController.getAddProduct);
router.post('/user/add-product', 
   [
      body('title')
         .not().isEmpty()
         .withMessage('Title cannot be empty'),
      body('price')
         .not().isEmpty().withMessage('Price cannot be empty')
   ] 
,isAuth, userController.postAddProduct);

router.get('/user/products', isAuth, userController.getProducts);

router.post('/user/edit-product', 
   [
      body('title')
         .trim()
         .not().isEmpty()
         .withMessage('Title cannot be empty'),
      body('price')
         .not().isEmpty()
         .withMessage('Price cannot be empty')    
   ]
,isAuth, userController.postEditProduct);
router.get('/user/edit-product/:productId', isAuth, userController.getEditProduct);

router.post('/user/delete-product', isAuth, userController.postDeleteProduct);

module.exports = router;