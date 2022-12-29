'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reservation.belongsTo(models.Hotel, { foreignKey: "hotel_id" })
      Reservation.belongsTo(models.User, { foreignKey: "user_id" })
      Reservation.belongsTo(models.Room, { foreignKey: "room_id" })
    }
  }
  Reservation.init({
    hotel_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    total_room: DataTypes.INTEGER,
    checkin: DataTypes.DATE,
    checkout: DataTypes.DATE,
    total_pembayaran: DataTypes.INTEGER,
    bukti_pembayaran: DataTypes.STRING,
    status: DataTypes.STRING,
    expired: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};