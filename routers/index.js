const router = require("express").Router();

const UserRouter = require("./user/userRouter");
const HotelRouter = require("./hotel/hotelRouter");

router.use("/users", UserRouter);
router.use("/hotels", HotelRouter);

module.exports = router;