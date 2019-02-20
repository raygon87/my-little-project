const Product = require('../models/product');

exports.getCart = (req,res,next) => {
   req.user.getCart()
      .then(cart => {
         cart.getProducts()
            .then(products => {
               let subTotal = 0;
               let taxPercent = .05;
               let totalPrice;
               let totalTax
               if(products) {
                  products.forEach(product => {
                     subTotal += product.cartItem.quantity * product.price;
                     subTotal = parseFloat(subTotal.toFixed(2));
                  })
                  totalTax = parseFloat((subTotal * taxPercent).toFixed(2));
                  totalPrice = parseFloat((totalTax + subTotal).toFixed(2));
                  res.render('cart/index', {
                     pageTitle: 'Your Cart',
                     path: '/cart',
                     products: products,
                     subTotal: subTotal,
                     tax: totalTax,
                     totalPrice: totalPrice
                  })
               }
            })
            .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
}

exports.postCart = (req,res,next) => {
   const prodId = req.params.productId;
   let fetchedCart;
   let newQuantity = 1;

   req.user.createCart()
      .then(result => {
         req.user.getCart({include: ['products']})
            .then(cart => {
               fetchedCart = cart;
               // if cart has product
               if(cart.products.length > 0) {
                  cart.getProducts({ where: {id: prodId} })
                     .then(products => {
                        let product = products[0];
                        if(product) {
                           const oldQuantity = product.cartItem.quantity;
                           newQuantity = oldQuantity + 1;
                           return fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
                              .then(result => { 
                                 res.redirect('/products')
                              })
                              .catch(err => console.log(err));
                        }
                        return Product.findByPk(prodId)
                           .then(product => {
                              fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
                           })
                           .then(result => {
                              res.redirect('/products')
                           })
                           .catch(err => console.log(err));
                     })
                     .catch(err => console.log(err))
               } else {
                  // if cart has no product yet
                  Product.findByPk(prodId)
                     .then(product => {
                        fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
                     })
                     .then(result => {
                        res.redirect('/products')
                     })
                     .catch(err => console.log(err));
               }
            })
      })
}

exports.postDeleteProductInTheCart = (req,res,next) => {
   const prodId = req.body.productId;
   req.user.getCart()
      .then(cart => {
         cart.getProducts({where: {id: prodId}})
            .then(products => {
               let product;
               if(products) {
                  product = products[0];
                  product.cartItem.destroy()
                     .then(result => {
                        res.redirect('/cart')
                     })
               }
            })
      })
      .catch(err => console.log(err));
}