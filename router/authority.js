const express = require("express");
let router = express.Router();
const {authorityRole} = require("../middlewares/roleCheck");
let {authenticate} = require("../middlewares/authenticate");
const authorityController = require("../controllers/authority");

router.get("/",authenticate,authorityRole,authorityController.authorityHomePage); 

router.post("/:action/:id",authenticate,authorityRole,authorityController.authorityActions);


router.get("/:id",authenticate,authorityRole,authorityController.authorityViewPage);

module.exports = router;