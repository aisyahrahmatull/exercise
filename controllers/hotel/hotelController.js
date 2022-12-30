const { Hotel, Room, Reservation} = require("../../models");
const sequelize = require('sequelize')
const db = require("../../models/index");
const joi = require("joi");
const { Op } = sequelize
class HotelController {
  static async uploudRoom(req, res) {
    try {
   
      let imagesDetail = req.protocol + "://" + req.get("host") + "room" + req.file.filename
       await Room.update({
        images : imagesDetail,
      }, {
        where: {
          id: req.params.id
        }
      })

      let dataFound = await Room.findOne({
        where: {
          id: req.params.id
        },
      })
  
      res.status(200).json({
        error: false,
        http_code: 201,
        message: "Uploud Room Successfully",
        data: dataFound
      });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || "Uploud Room Failed",
      });
    }
  }

  static async uploudHotel(req, res) {
    try {
      
      let images = req.protocol + "://" + req.get("host") + "hotel" + req.file.filename;
      await Hotel.update({
        images : images,
      }, {
        where: {
          id: req.params.id
        }
      })

      let dataFound = await Hotel.findOne({
        where: {
          id: req.params.id
        },
      })
  
      res.status(200).json({
        error: false,
        http_code: 201,
        message: "Uploud Hotel Successfully",
        data: dataFound
      });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || "Uploud Hotel Failed",
      });
    }
  }


  static async create(req, res) { 
    try {
      let hotelData = {
        hotel_name: "",
        location: "",
        detail: [{
          room_name : "",
          capacity : "",
          price : ""
        }]
      }
      const body = await joi.object({
        hotel_name: joi.string(),
        location: joi.string(),
        detail : joi.array().items(joi.object({
          room_name : joi.string(),
          capacity: joi.number(),
          price: joi.number(),
        }))
      }).validateAsync(req.body);

      hotelData = {
        hotel_name: body.hotel_name,
        location: body.location,
        detail : body.detail
      }

      let dataFound = await Hotel.findAll({
        where: {
          name: hotelData?.hotel_name,
        },
        raw : true
      })

      if (dataFound.length > 0) {
        throw {
          error: true,
          code: 404,
          message: "Hotel already exist"
        }
      } 

      const dataHotel = await Hotel.create({
        name: hotelData?.hotel_name,
        location: hotelData?.location,
      })   

      for (const item of hotelData.detail){
        await Room.create({
          hotel_id : dataHotel.id,
          name: item.room_name,
          capacity : item.capacity,
          price: item.price
        })   
      }

      let dataDB = await Room.findAll({
        where: {
          hotel_id: dataHotel.id,
        },
        include: [
          {
            model: Hotel,
            attributes: ["id", "name", "location", "images"]
          },
        ],
      })

      res.status(201).json({
        error: false,
        http_code: 201,
        message: "created data successfully",
        data: dataDB,
      });

    } catch (error) {
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || error?.message,
      });
    }
  }

  static async getAllHotel(req, res) {
    try {
     
      const allData = []
      const dataDB = await Hotel.findAll({
        attributes: ["id", "name", "location", "images"],
        include: 
          {
            model: Room,
            attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3"],
          },
      })

      for (const item of dataDB){
        const dataRooms = []
        item.dataValues.Rooms.map((data)=>{
          const rooms  = {
            id : data.dataValues.id,
            name :data.dataValues.name, 
            price : data.dataValues.price, 
            capacity : data.dataValues.capacity,
            images : [data.dataValues.images1, data.dataValues.images2, data.dataValues.images3]
          }
          dataRooms.push(rooms)
        })

        const data = {
          id : item.dataValues.id, 
          name : item.dataValues.name, 
          location : item.dataValues.location,
          images : item.dataValues.images,
          room : dataRooms
        }
        allData.push(data)
      }

      res.status(200).json({
        error: false,
        http_code: 201,
        message: "Get One Data Successfully",
        data: allData,
      });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || "Get Data Failed",
      });
    }
  }

  static async getOneHotel(req, res) {
    try {
      const allData = []
      const dataDB = await Hotel.findAll({
        where: {
          id : req.params.id
        },
        attributes: ["id", "name", "location", "images"],
        include: 
          {
            model: Room,
            attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3"],
          },
      })

      for (const item of dataDB){
        const dataRooms = []
        item.dataValues.Rooms.map((data)=>{
          const rooms  = {
            id : data.dataValues.id,
            name :data.dataValues.name, 
            price : data.dataValues.price, 
            capacity : data.dataValues.capacity,
            images : [data.dataValues.images1, data.dataValues.images2, data.dataValues.images3]
          }
          dataRooms.push(rooms)
        })

        const data = {
          id : item.dataValues.id, 
          name : item.dataValues.name, 
          location : item.dataValues.location,
          images : item.dataValues.images,
          room : dataRooms
        }
        allData.push(data)
      }

      res.status(200).json({
        error: false,
        http_code: 201,
        message: "Get One Data Successfully",
        data: allData,
      });
    } catch (error) {
      console.log('error', error)
      res.status(500).json({
        error: true,
        http_code: 500,
        message: error?.details?.[0]?.message || "Get Data Failed",
      });
    }
  }


    static async search(req, res) { 
      try {
        const allData = []
        let location = req.query?.location || "";
        let priceMin = req.query?.from || "";
        let priceMax = req.query?.to || "";
        let startDate = req.query?.checkin || "";
        let endDate = req.query?.checkout || "";
  
        let locationQuery = sequelize.where(
          sequelize.fn("lower", sequelize.col("location")),
          Op.like,
          sequelize.fn("lower", `%${location}%`)
        )

        if(location){
          const dataDB = await Hotel.findAll({
            where: {
              locationQuery
            },
            attributes: ["id", "name", "location", "images"],
            include: 
              {
                model: Room,
                attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3"],
              },
          })

          for (const item of dataDB){
            const dataRooms = []
            item.dataValues.Rooms.map((data)=>{
              const rooms  = {
                id : data.dataValues.id,
                name :data.dataValues.name, 
                price : data.dataValues.price, 
                capacity : data.dataValues.capacity,
                images : [data.dataValues.images1, data.dataValues.images2, data.dataValues.images3]
              }
              dataRooms.push(rooms)
            })

            const data = {
              id : item.dataValues.id, 
              name : item.dataValues.name, 
              location : item.dataValues.location,
              images : item.dataValues.images,
              room : dataRooms
            }
            allData.push(data)
          }
          
        }

        if(priceMin){
          const dataDB = await Hotel.findAll({
            attributes: ["id", "name", "location", "images"],
            include: 
              {
                model: Room,
                where : {"price" : {[Op.between] : [priceMin , priceMax ]}},
                attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3"],
              },
          })

          for (const item of dataDB){
            const dataRooms = []
            item.dataValues.Rooms.map((data)=>{
              const rooms  = {
                id : data.dataValues.id,
                name :data.dataValues.name, 
                price : data.dataValues.price, 
                capacity : data.dataValues.capacity,
                images : [data.dataValues.images1, data.dataValues.images2, data.dataValues.images3]
              }
              dataRooms.push(rooms)
            })

            const data = {
              id : item.dataValues.id, 
              name : item.dataValues.name, 
              location : item.dataValues.location,
              images : item.dataValues.images,
              room : dataRooms
            }
            allData.push(data)
          }
        }

        if(startDate){
          const where = {
              [Op.or]: [{
                  checkin: {
                  [Op.between]: [startDate, endDate]
                }
              }, {
                checkout: {
                  [Op.between]: [startDate, endDate]
                }
              }]
          };
          
          const dataReservasi = await Reservation.findAll({
            where : where,
            attributes: ["id", "hotel_id", "room_id", "total_room", "checkin", "checkout"],
            raw: true
          })

          const reservasi = []
          if(dataReservasi){
            for (const items of dataReservasi) {
              const dataDB = await Room.findAll({
                where : {
                  id : items.room_id
                },
                attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3", "hotel_id"],
                raw: true
              })
  
              dataDB.map((d)=>{
                let total_room = d.capacity - items.total_room
                if(total_room > 0){
                  const data = {
                    hotel_id : d.hotel_id,
                    room_id : d.id,
                    sisaRoom : total_room
                  }
                  reservasi.push(data)
                }
              })
            }  
          }
         
          if(reservasi.length > 0){
            const dataHotelDB = await Hotel.findAll({
              attributes: ["id", "name", "location", "images"],
             raw : true
            })

            const dataRoomDB = await Room.findAll({
              attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3", "hotel_id"],
              raw : true
            })

            const dataRooms = []
            for (const items of dataRoomDB) {
              var findRooms =  reservasi.find((v) => items.id == v.room_id && v.hotel_id == items.hotel_id)
              if(findRooms){
                if(items.hotel_id == findRooms.hotel_id && items.id == findRooms.room_id){
                  const updateData = {
                    id : items.id,
                    name : items.name,
                    price : items.price,
                    hotel_id : items.hotel_id, 
                    sisaRoom : findRooms.sisaRoom,
                    images : [items.images1, items.images2, items.images3]
                  }
                  dataRooms.push({update : updateData})
                }
              }
              const oldData = {
                id : items.id,
                name : items.name,
                price : items.price,
                hotel_id : items.hotel_id, 
                images : [items.images1, items.images2, items.images3]
              }
              dataRooms.push({old: oldData})
            }

            if(dataRooms.length > 0){
              dataRooms.map((d)=>{
                console.log('DATAA', d)
                if(d.update && d.old){
                  console.log('yes')
                }
                // if(d.update.hotel_id == d.old.hotel_id && d.update.id == d.old.id){
                //   var findHotel =  dataHotelDB?.find((v) => v.id == d.old.hotel_id)
                //   console.log('findHotel', findHotel)
                // }
               
              })
            }

           

            
           
          }
          // console.log('reservasi', reservasi)
          // console.log('reservasi', reservasi.length)
          
        }

        if(location && priceMin && startDate){
          const dataDB = await Hotel.findAll({
            attributes: ["id", "name", "location", "images"],
            where: {
              locationQuery
            },
            include: 
              {
                model: Room,
                where : {"price" : {[Op.between] : [priceMin , priceMax ]}},
                attributes: ["id", "name", "price", "capacity", "images1", "images2", "images3"],
              },
          })

            for (const item of dataDB){
            const dataRooms = []
            item.dataValues.Rooms.map((data)=>{
              const rooms  = {
                id : data.dataValues.id,
                name :data.dataValues.name, 
                price : data.dataValues.price, 
                capacity : data.dataValues.capacity,
                images : [data.dataValues.images1, data.dataValues.images2, data.dataValues.images3]
              }
              dataRooms.push(rooms)
            })

            const data = {
              id : item.dataValues.id, 
              name : item.dataValues.name, 
              location : item.dataValues.location,
              images : item.dataValues.images,
              room : dataRooms
            }
            allData.push(data)
          }
        }
     
        res.status(200).json({
          error: false,
          http_code: 201,
          message: "Search Data Successfully",
          data: allData 
        });
        
      } catch (error) {
        console.log('error', error)
        res.status(500).json({
          error: true,
          http_code: 500,
          message: error?.details?.[0]?.message || error?.message,
          data: []
        });
      }
    }
}

module.exports = HotelController;