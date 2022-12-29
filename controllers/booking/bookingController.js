const { Hotel, Room, Reservation} = require("../../models");
const sequelize = require('sequelize')
const db = require("../../models/index");
const joi = require("joi");
const { Op } = sequelize

class BookingController {
  static async uploudPaymentProof(req, res) {
    try {
      
      let images = req.protocol + "://" + req.get("host") + "hotel" + req.file.filename;
      let dataFound = await Book.findOne({
        where: {
          id: req.params.id
        },
        raw : true
      })

      if(dataFound.status ==  "Waiting for Payment" && dataFound.expired == false){

         
      var newDate =  new Date().getTime()
      let endTime = new Date(dataFound.createdAt).getTime(dataFound.createdAt) + (60000 * 60);
    
        if(newDate > endTime){
          Book.update({
            status : "Payment Failed",
            expired : true
          }, {
            where: {
              id: req.params.id
            }
          })
          throw { message: 'Payment Expired'}
        }else{
          Book.update({
            payment_proof : images,
            status : "Payment Success",
            expired : true
          }, {
            where: {
              id: req.params.id
            }
          })
        }
        
        res.status(200).json({
          error: false,
          http_code: 201,
          message: "Uploud Payment Successfully",
        });
        }

  
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || "Uploud Payment Failed",
      });
    }
  }

  static async create(req, res) { 
    try {
      let hotelData = {
        hotel_id: "",
        user_id : "",
        status : "",
        expired : false,
        detail: [{
          room_id : "",
          total_room : "",
          price : "",
          checkin: "",
          checkout : "",
        }]
      }
      const body = await joi.object({
        hotel_id: joi.number(),
        user_id : joi.string(), 
        detail : joi.array().items(joi.object({
          room_id : joi.number(),
          total_room: joi.number(),
          price: joi.number(),
          checkin: joi.date(),
          checkout: joi.date(),
        }))
      }).validateAsync(req.body);

      hotelData = {
        hotel_id: body.hotel_id,
        user_id : body.user_id,
        status : "Waiting for Payment",
        expired : false,
        detail: body.detail
      }
     
      let dataALL = await Room.findAll({
        where: {
          hotel_id: hotelData.hotel_id,
        },
        order: [["id"]],
        raw: true
      })

      for (const item of hotelData.detail) {
        var getRoom =  dataALL?.filter((v) => v.id == item.room_id)
        var findRoom =  getRoom?.filter((v) => item.total_room > v.capacity)
        var findRooms =  getRoom?.find((v) => item.room_id == v.id)
        const checkin = new Date(item.checkin).getTime()
        const checkout = new Date(item.checkout).getTime()
        const totalDay = Math.floor((checkout-checkin)/(24*3600*1000))
        const totalPrice = (item.total_room * findRooms.price) * totalDay

        if(findRoom.length > 0){
          throw { message: 'The Room is Full' }
        }

        const booking = await Reservation.create({
          hotel_id : hotelData.hotel_id,
          room_id : item.room_id,
          user_id : hotelData.user_id,
          total_room : item.total_room,
          checkin : item.checkin,
          checkout : item.checkout,
          total_pembayaran : totalPrice,
          status : hotelData.status,
          expired : hotelData.expired
        })

        let dataDB = await Reservation.findOne({
          where: {
            id: booking.id,
          },
          include: [
            {
              model: Hotel,
              attributes: ["id", "name", "location", "images"]
            },
            {
              model: Room,
              attributes: ["id", "name", "capacity", "price"]
            },
          ],
        })
        res.status(201).json({
          error: false,
          http_code: 201,
          message: "Booking Room Successfully",
          data: dataDB,
        });
      }
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || error?.message,
      });
    }
  }



 
}

module.exports = BookingController;