const Sequelize = require('sequelize');
const sequelize = new Sequelize('nodestore', 'raymondgonzales', 'secret', {
   dialect: 'postgres',
   host: 'localhost',
   logging: false
});

module.exports = sequelize; 