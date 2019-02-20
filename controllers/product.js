const Product = require('../models/product');

exports.getIndex = (req,res) => {
   Product.findAll()
      .then(products => {
         res.render('index', {
            path: '/',
            pageTitle: 'Home',
            products: products
         });
      })
};

exports.getProducts = (req,res) => {
   Product.findAll()
      .then(products => {
         res.render('product/products', {
            path: '/products',
            pageTitle: 'Products',
            products: products
         });
      })
};

exports.getProduct = (req,res,next) => {
   const prodId = req.params.productId;
   Product.findByPk(prodId)
      .then(product => {
         res.render('product/detailed-product', {
            pageTitle: 'Details',
            path: '/products',
            product: product
         })
      })
};