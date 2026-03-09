const Tracking = require("../models/Main");

module.exports.userRole = async(req,res,next) => {
    let user = await Tracking.findById(req.user.id);
    if(user.role === "user") {
         next();
    }
    else{
        res.redirect("/user/login");
    }
}

module.exports.authorityRole = async(req,res,next) => {
    let user = await Tracking.findById(req.user.id);
    if(user.role === "Authority") {
        next();
    }
    else{
        res.redirect("/user/login");
    }
}

module.exports.adminRole = async(req,res,next) => {
    let user = await Tracking.findById(req.user.id);
    if(user.role === "admin") {
        next();
    }
    else{
        res.redirect("/user/login");
    }
}