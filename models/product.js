const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
   },
   title: {
      type: Sequelize.STRING
   },
   image: {
      type: Sequelize.STRING,
      allowNull: true
   },
   price: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   description: {
      type: Sequelize.STRING
   }   
});

module.exports = Product;