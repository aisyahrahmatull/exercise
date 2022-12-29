const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const sequelize = require('sequelize')
const db = require("../../models/index");
const joi = require("joi");
const { encrypt } = require("../../helper/bcrypt")
const crypto = require('crypto')
const validator = require('validator')
const { Op } = sequelize

class UserController {
    static async register(req, res) {
        try {
          let userData = {
            username: "",
            email: "",
            password: "",
          }
    
          const body = await joi.object({
            username: joi.string().required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
          }).validateAsync(req.body)

          if(!body.username || !body.email || !body.password) throw { message: 'Data Not Completed!' }
          if(!validator.isEmail(body.email)) throw { message: 'Email Invalid' }
          if(!body.username.match("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{4,}")) throw { message: 'Username should be contain uppercase, lowercase, number, and symbol' }
          if(!body.password.match("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])")) throw { message: 'Password should be contain uppercase, lowercase, number, and symbol' }
          if(body.password.length > 10) throw { message: 'Password Maximum 10 Character' }
          if(body.password.length < 6) throw { message: 'Password Minimum 6 Character' }

          const hmac = crypto.createHmac('sha256', 'abc123')
          hmac.update(body.password)
          const passwordHashed = hmac.digest('hex')
          body.password = passwordHashed
          userData = {
            username : body.username,
            email : body.email,
            password : body.password, 
            role : "user"
          };
 
          User.findOne({
            where: {
              username: req.body.username,
            }
          })
            .then(async function (data) {
              if (data) {
                res.status(400).json({ status: true, http_code: 404, message: "Username already used!", data: [] });
              } else {
                User.create(userData)
                  .then(data => {
                    res.status(201).json({
                      error: false,
                      http_code: 201,
                      message: "created user successfully",
                      data: data,
                    });
                  })
                  .catch(err => {
                    console.log(err);
                  })
              }
            })
        } catch (err) {
          res.status(400).json({
            error: true,
            http_code: 400,
            message:  err?.details?.[0]?.message || err?.message,
            data: []
          });
        }
    }

    static async login(req, res) { 
      try {
        let user = await joi.object({
          username: joi.string(),
          password: joi.string(),
          email: joi.string().email(),
        }).validateAsync(req.query);

        const hmac = crypto.createHmac('sha256', 'abc123')
        hmac.update(user.password)
        const passwordHashed = hmac.digest('hex')
        user.password = passwordHashed

        if(user.username){
          const data = await User.findOne({
            where: {
              username: user?.username,
              password : user.password
            },
          })

          if(!data) throw { message: 'Username or Password Invalid' }
    
          if (data.dataValues){
            const token = jwt.sign(
              {
                id: data.dataValues.id, 
                username: data.dataValues.username,
                email: data.dataValues.email,
                role: data.dataValues.role,
              },
              '123abc',
              {
                expiresIn: "20h",
              }
            );
            res.status(200).json({
              error: false,
              http_code: 200,
              message: "Login Succes",
              data: {
                type: "bearer",
                token: token,
                user_info: {
                  username: data.dataValues.username,
                  email: data.dataValues.email,
                  role: data.dataValues.role,
                }
              }
            });
          }
        }

        if(user.email){
          const data = await User.findOne({
            where: {
             email: user?.email,
              password : user.password
            },
          })

          if(!data) throw { message: 'Email or Password Invalid' }
          
          if (data.dataValues){
            const token = jwt.sign(
              {
                id: data.dataValues.id, 
                username: data.dataValues.username,
                email: data.dataValues.email,
                role: data.dataValues.role,
              },
              '123abc',
              {
                expiresIn: "20h",
              }
            );
            res.status(200).json({
              error: false,
              http_code: 200,
              message: "Login Succes",
              data: {
                type: "bearer",
                token: token,
                user_info: {
                  username: data.dataValues.username,
                  email: data.dataValues.email,
                  role: data.dataValues.role,
                }
              }
            });
          }
        }
      } catch (error) {
        res.status(500).json({
          error: true,
          http_code: 500,
          message: error?.details?.[0]?.message || error?.message,
          data: []
        });
      }
    }
}

module.exports = UserController;