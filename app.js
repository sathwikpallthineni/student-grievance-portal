require('dotenv').config();
const express = require("express");
const engine = require('ejs-mate');
const mongoose = require("mongoose");
const sessions = require("express-session");
const flash = require("connect-flash");
const app = express();
let userRouter = require("./router/user");
let adminRouter = require("./router/admin");
let authorityRouter = require("./router/authority");
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080;



app.listen(PORT,(req,res) => {
    console.log(`server running on port ${PORT}`);
});

// mongoose.connect(process.env.MONGO_URL)
mongoose.connect("mongodb://127.0.0.1:27017/SMARTGRIEVANCE_TRACKING")
.then(() => {
    console.log("successfully connected to DATABASE");
})
.catch((err) => {
    console.log("error");
})

app.engine('ejs', engine);
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(sessions({ secret: 'secretcode', resave: false, saveUninitialized: false }));
app.use(flash());

app.use((req,res,next) => {
    res.locals.user = req.user;
    res.locals.username = req.user;
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    res.locals.path = req.path;
    next();
});
app.use("/user",userRouter);
app.use("/admin",adminRouter);
app.use("/authority",authorityRouter);
app.get("/",(req,res) => {
    res.redirect("/user/login");
})




app.use((err,req,res,next) => {
    let {status=500,message="some error"} = err;
    res.render("errorhandling.ejs",{message,title:"Error | Grievance Portal"});
});