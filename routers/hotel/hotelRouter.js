const router = require("express").Router();
const HotelController = require("../../controllers/hotel/hotelController");
const BookingController = require("../../controllers/booking/bookingController");
const multerUpload = require('../../middleware/multer')

router.post("/create", HotelController.create);
router.patch("/uploud/:id", multerUpload.single("photo"), HotelController.uploudRoom);
router.patch("/update/:id", multerUpload.single("photo"), HotelController.uploudHotel);
router.get("/search", HotelController.search);
router.get("/all", HotelController.getAllHotel);
router.get("/details/:id", HotelController.getOneHotel);

// booking
router.post("/book", BookingController.create);
router.patch("/payment/:id", multerUpload.single("photo"), BookingController.uploudPaymentProof);

module.exports = router;