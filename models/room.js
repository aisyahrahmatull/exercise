'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Room.belongsTo(models.Hotel, { foreignKey: "hotel_id" })
      Room.hasMany(models.Reservation, { foreignKey: "room_id" })
      
    }
  }
  Room.init({
    name: DataTypes.STRING,
    hotel_id: DataTypes.INTEGER,
    capacity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    images1: DataTypes.STRING,
    images2: DataTypes.STRING,
    images3: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};