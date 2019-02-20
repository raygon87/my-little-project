const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csrf = require('csurf');
const multer = require('multer');

const sequelize = require('./util/database');
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

const fileFilter = (req,file,cb) => {
   if(
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'
   ) {
      cb(null, true); //null as an error true if we want to store that file
   } else {
      cb(null,false)
   }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const csrfProtection = csrf();
const store = new SequelizeStore({db: sequelize});
const fileStorage = multer.diskStorage({
   destination: (req,file,cb) => {
      cb(null, 'images');
   },
   filename: (req,file,cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
   }
});
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const errorRoutes = require('./routes/error');

app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({dest: 'images', storage: fileStorage, fileFilter: fileFilter}).single('image')) // image is the input name in the view
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
   secret: 'mysecret',
   resave: false,
   saveUninitialized: false,
   store: store
}));
app.use(csrfProtection);

app.use((req,res,next) => {
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   res.locals.user = req.session.user;
   next()
})

// extracting user. to use req.user
app.use((req,res,next) => {
   if(!req.session.user) {
      return next();
   }
   User.findByPk(req.session.user.id)
      .then(user => {
         req.user = user;
         next();
      })
      .catch(err => console.log(err));
})

app.use(productRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(errorRoutes);

Product.belongsTo(User);
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

// sequelize.sync({force:true}); 

const port = 8080;
app.listen(8080, () => {
   console.log(`server is running on port ${port}`);
});