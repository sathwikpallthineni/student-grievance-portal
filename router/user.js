const express = require("express");
let router = express.Router();
const {userRole} = require("../middlewares/roleCheck");
const flash = require("connect-flash");
let {grievanceValidation,userValidation} = require("../middlewares/validation");
const multer  = require('multer');
const storage = require("../utils/cloudinary");
const upload = multer({ storage });
let {authenticate} = require("../middlewares/authenticate");
const userController = require("../controllers/user");

router.get("/",authenticate,userRole,userController.userHomePage);


router.get("/newgrievance",authenticate,userRole,userController.userRenderNewPage);

router.post("/",authenticate,userRole,upload.single("attachments"),grievanceValidation,userController.userNewPage);

router.get("/signup",userController.renderSignup);
router.post("/signup",userValidation,userController.Signup);

router.post("/logout",authenticate,userController.Logout);


router.get("/login",userController.renderLogin);

router.post("/login",userController.Login);
router.get("/:id",authenticate,userRole,userController.userViewPage);

module.exports = router;