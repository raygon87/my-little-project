const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.get('/', productController.getIndex);

router.get('/products', productController.getProducts);

router.get('/product/:productId', productController.getProduct);
module.exports = router;
