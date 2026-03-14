const Tracking = require("../models/Main");
const Grievance = require("../models/grievance");
const storage = require("../utils/cloudinary");
const multer  = require('multer');
const mongoose = require("mongoose");
const upload = multer({ storage });
const jwt = require('jsonwebtoken');
const transporter = require("../utils/email");
const { title } = require("process");


 async function tokenGeneration(user,req,res,next) {
    if(!user || !user.id) {
        return res.status(404).send("user not found");
    }

    const Access_Token = jwt.sign(
        {id:user.id},
        process.env.SECRET_KEY,
        {expiresIn:"15m"},
    );

    const Refresh_Token = jwt.sign(
        {id:user.id},
        process.env.REFRESH_KEY,
        {expiresIn:"7d"},
    );
    
    let document = await Tracking.findById(user.id);
    document.refresh_token = Refresh_Token;
    await document.save();

    res.cookie("access_token",Access_Token,{
               httpOnly: true,
               maxAge:15*60*1000,
            });
    res.cookie("refresh_token",Refresh_Token,{
               httpOnly: true,
               maxAge:7*24*60*60*1000,
            });
    req.flash("success",`Welcome  ${document.username}`);

    if(user.role == "user"){
        return  res.redirect("/user");
    }
    if(user.role == "Authority"){
        return  res.redirect("/authority");
    }
    if(user.role == "admin"){
        return  res.redirect("/admin");
    }
}

module.exports.userHomePage = async(req,res,next) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).send( "Invalid grievance ID.");
   }
    let user = await Tracking.findById(req.user.id).populate("grievances");
    if(!user) {
        res.status(400).send("user not found");
    }

    let datas = user.grievances;
    let {filter} = req.query;
    let grievances = [];
    if(!filter || filter === "All"){
        grievances.push(...datas);
    }
    if(filter === "In Progress") {
        let a = datas.filter((el) => {
            return el.status == filter;
        });
        grievances.push(...a);
    }
    if(filter === "Under Review"){
        let data = await Grievance.find({raised_By:user.username,status:"Under Review"});
        grievances.push(...data);
    }
    if(filter === "Submitted"){
        let data = await Grievance.find({raised_By:user.username,status:"Submitted"});
        grievances.push(...data);
    }
    if(filter === "ResolvedWithin") {
        for(let data of datas) {
            if(data.slaStatus === "On Track"){
                grievances.push(data);
            }
        }
    }
    if(filter === "ResolvedAfter") {
        for(let data of datas) {
            if(data.slaStatus === "Breached"){
                grievances.push(data);
            }
        }
    }
    res.locals.username = user.username;
    res.render("user.ejs",{grievances,user,datas,title:"My Grievances | Grievance Portal"});
    }catch(err){
        next(err);
    }
    
}


module.exports.userRenderNewPage = async(req,res,next) => {
    try{let user = await Tracking.findById(req.user.id);
    if(user.status != "Active") {
        return res.status(403).send("User is Blocked please contact ADMIN");
    }
    res.render("newgrievance.ejs",{title:"Raise Grievance | Grievance Portal"});
    }catch(err) {
        next(err);
    }
    
}

module.exports.userNewPage = async(req,res,next) => {
   try{
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).send( "Invalid grievance ID.");
   }

    let user = await Tracking.findById(req.user.id);
    if(!user){
       return res.status(404).send("Not Found");
    }

    if( user.status != "Active") {
        return res.status(403).send("User is Blocked cannot create new Grievances");
    }

    let grievance = new Grievance({
        ...req.body,
        raised_By:user.username,
        status:"Submitted",
        file_Url: req.file? req.file.path:null,
    });

    grievance.history.push({status:"Submitted",done_By:user.username,});
    user.grievances.push(grievance);
    await grievance.save();
    await user.save();

     req.flash("success","Grievance submitted successfully. Please check your email for confirmation and further updates.");
    res.redirect("/user");

    const grievanceCreatedUserEmail = `
Your grievance has been successfully submitted.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Submitted On: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        })}
- Current Status: Pending Assignment

Our team will review and assign it to the appropriate authority.

You will be notified once it has been assigned.

This is an automated message. Please do not reply.
`;

if (user && user.email) {
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Grievance Submitted – ${grievance._id}`,
    text: grievanceCreatedUserEmail,
  }).catch(err => {
    console.log("Email failed:", err.message);
  });
}
let admin = await Tracking.findOne({role:"admin"});
const grievanceCreatedAdminEmail = `
A new grievance has been submitted and requires assignment.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Raised By: ${user.username}
- Submitted On: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        })}

Please log in to review and assign the grievance to the appropriate authority.
`;

res.redirect("/user");

if (admin && admin.email) {
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: admin.email,
    subject: `New Grievance Submitted – ID #${grievance._id}`,
    text: grievanceCreatedAdminEmail
  }).catch(err => {
    console.log("Email failed:", err.message);
  });
}
}catch(err){
    next(err);
   }
    
}

module.exports.userViewPage = async(req,res,next) => {
    try{
        let {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send( "Invalid grievance ID.");
    }
    let grievance = await Grievance.findById(id);
    if(!grievance) {
        return res.status(404).send("grievance not found");
    }
    let grievanceHistories = grievance.history;
   
    res.render("viewgrievance.ejs",{grievance,grievanceHistories,title:"Grievance Details | Grievance Portal"});
   }catch(err){
    next(err);
   }
    
}

module.exports.renderSignup = (req,res,next) => {
    try{
        res.render("signup.ejs",{title:"Sign Up | Grievance Portal"});
   }catch(err){
    next(err);
   }
   
}

module.exports.renderLogin = (req,res,next) => {
    try{
        res.render("login.ejs",{title:"Login | Grievance Portal"});
   }catch(err){
    next(err);
   }
    
}

module.exports.Signup = async(req,res,next) => {
    try{
        let {username,password,email} = req.body;
    let user = new Tracking({
        username:username,
        email:email,
        role:"user",
        status:"Active",
    });
    let result = await Tracking.register(user,password);
    tokenGeneration(result,req,res,next);
   }catch(err){
    next(err);
   }
    

}

module.exports.Login = async(req,res,next) => {
    try{
        let {username,password} = req.body || {};
    let user = await Tracking.findOne({username:username});
    if(!user){
        req.flash("failure","username doesnt exist");
        return res.redirect("/user/login");
    }
    let pass_verify = await user.authenticate(password);
    if(!pass_verify.user) {
        req.flash("failure","wrong password");
        return res.redirect("/user/login");
    }
    
    tokenGeneration(user,req,res,next);
    
   }catch(err){
    next(err);
   }
    
}

module.exports.Logout = async(req,res,next) => {
    try{
        let document = await Tracking.findById(req.user.id);
    document.refresh_token = null;
    await document.save();
    res.clearCookie("access_token",{
        httpOnly:true,
        maxAge: 15*60*1000,
    });
     res.clearCookie("refresh_token",{
        httpOnly:true,
        maxAge: 15*60*1000,
    }); 
    req.flash("success","Logout Successful");
    res.redirect("/user/login");
   }catch(err){
    next(err);
   }
}