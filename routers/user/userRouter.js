const router = require("express").Router();
const UserController = require("../../controllers/user/userController");

router.post("/register", UserController.register);
router.get("/login", UserController.login);

module.exports = router;