const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const User = require('../models/user');

exports.getEditUserProfile = (req,res,next) => {
   res.render('user/edit-profile', {
      pageTitle: 'Edit Profile',
      path: '/edit-profile',
      errorMessage: '',
      validationErrors: [],
      user: req.user
   })
};

exports.postEditUserProfile = (req,res,next) => {
   const firstName = req.body.firstName;
   const lastName = req.body.lastName;
   const email = req.body.email;
   User.findByPk(req.user.id)
      .then(user => {
         if(user.id === req.user.id) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.save()
            .then(result => {
               req.session.user = user
               return req.session.save(() => {
                  res.redirect('/')
               })
            })
            .catch(err => console.log(err));
         }
      })
};

// get user products
exports.getProducts = (req,res,next) => {
   req.user.getProducts()
      .then(products => {
         res.render('user/user-products', {
            path: '/user/products',
            pageTitle: 'Your Products',
            products: products
         })
      })
}

exports.getAddProduct = (req,res,next) => {
   res.render('user/add-product', {
      pageTitle: 'Add Product',
      path: '/user/add-product',
      errorMessage: '',
      oldInput: {
         title: '',
         image: '',
         price: '',
         description: ''
      }
   })
}

exports.postAddProduct = (req,res,next) => {
   const title = req.body.title;
   let image = req.file;
   const price = req.body.price;
   const description = req.body.description;
   const errors = validationResult(req);
   console.log(errors.array())
   // if(!image) {
   //    return res.status(422).render('user/add-product', {
   //       pageTitle: 'Add Product', 
   //       path: '/user/add-product',
   //       oldInput: {
   //          title: title,
   //          image: image,
   //          price: price,
   //          description: description
   //       },
   //       errorMessage: ''
   //    })
   // }

   if(!errors.isEmpty()) { 
      return res.status(422).render('user/add-product', {
         pageTitle: 'Add Product',
         path: '/user/add-product',
         oldInput: {
            title: title,
            image: image,
            price: price,
            description: description
         },
         errorMessage: errors.array()[0].msg,
      })
   }

   console.log(image)

   if(image) {
      image = image.path
   } else {
      image = null
   }
   
   req.user.createProduct({
      title: title,
      image: image,
      price: price,
      description: description
   })
   .then(result => {
      console.log('Created Product');
      res.redirect('/user/products');
   })
   .catch(err => console.log('afteradding',err));
};

exports.getEditProduct = (req,res,next) => {
   const prodId = req.params.productId;
   Product.findByPk(prodId)
      .then(product => {
         if(!product) {
            return res.redirect('/');
         }
         res.render('user/edit-product', {
            pageTitle: 'Edit Product',
            path: '/user/products',
            product: product,
            hasError: false,
            errorMessage: ''
         })
      })
      .catch(err => console.log(err));
};

exports.postEditProduct = (req,res,next) => {
   const prodId = req.body.productId
   const updatedTitle = req.body.title;
   const image = req.file;
   const updatedPrice = req.body.price;
   const updatedDescription = req.body.description;
   const errors = validationResult(req);
   console.log('image',image)
   console.log(errors.array())
   if(!errors.isEmpty()) {
      return res.status(422).render('user/edit-product', {
         pageTitle: 'Edit Product',
         path: '/user/products',
         hasError: true,
         oldInput: {
            updatedTitle: updatedTitle,
            updatedImage: updatedImage,
            updatedPrice: updatedPrice,
            updatedDescription: updatedDescription
         },
         errorMessage: errors.array()[0].msg
      })
   }
   Product.findByPk(prodId)
      .then(product => {
         if(!product) {
            return res.redirect('/user/products')
         }
         product.title = updatedTitle;
         if(image) {
            product.image = image.path;
         }
         product.price = updatedPrice;
         product.description = updatedDescription;
         return product.save()
            .then(result => {
               console.log('Updated Product');
               res.redirect('/user/products');
            })
      })
      .catch(err => console.log(err))
};

exports.postDeleteProduct = (req,res,next) => {
   const prodId = req.body.productId;
   console.log('prodId:', prodId)
   Product.findByPk(prodId)
      .then(product => {
         if(!product) {
            return res.redirect('/')
         }
         return product.destroy()
            .then(result => {
               console.log(`Product deleted with Id of: ${prodId}`);
               res.redirect('/user/products')
            })
      })
}