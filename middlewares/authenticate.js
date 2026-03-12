const jwt = require("jsonwebtoken");
const Tracking = require("../models/Main");


module.exports.authenticate = async(req,res,next) => {
    let access_token = req.cookies.access_token;
    let refresh_token = req.cookies.refresh_token;
    // console.log(access_token,refresh_token);
    if(!access_token && !refresh_token){
        return res.redirect("/user/login");
    }

    if(access_token) {
        try{
            let decoded = jwt.verify(access_token,process.env.SECRET_KEY);
            req.user = decoded;
           return next();
        }catch(err) {

            if(err.name != "TokenExpiredError"){
                return res.redirect("/user/login");
            }
        }
    }

    if( refresh_token){
        try{
        let decoded = jwt.verify(refresh_token,process.env.REFRESH_KEY);
        let document = await Tracking.findById(decoded.id);
        if(document.refresh_token != refresh_token){
            return res.status(401).send("Invalid");
        }
        let Access_Token = jwt.sign(
            {id:decoded.id},
            process.env.SECRET_KEY,
            {expiresIn:"15m"},
        );
        res.cookie("access_token",Access_Token,{
           httpOnly: true,
           maxAge:15*60*1000,
        });
        req.user = decoded;
        return next();

        }catch(err){
        return res.redirect("/user/login");
        }
    }  
        
    return res.redirect("/user/login");
}
    