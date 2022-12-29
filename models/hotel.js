'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hotel.hasMany(models.Room, { foreignKey: "hotel_id" })
      Hotel.hasMany(models.Reservation, { foreignKey: "hotel_id" })
     
    }
  }
  Hotel.init({
    name: DataTypes.STRING,
    location: DataTypes.STRING,
    images: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Hotel',
  });
  return Hotel;
};