const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const isAuth = require('../middleware/isAuth');

router.get('/cart', cartController.getCart);
router.post('/cart/:productId', isAuth, cartController.postCart);

router.post('/cart', cartController.postDeleteProductInTheCart);

module.exports = router;