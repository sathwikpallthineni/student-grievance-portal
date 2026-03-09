let validator = require("validator");

module.exports.grievanceValidation = (req,res,next) => {
    let {title,description,category} = req.body || {};
    if(!title || !description || !category) {
       return res.status(403).send("All fields required");
    }
    next();
}

module.exports.userValidation = (req,res,next) => {
    let {username,email,password} = req.body || {};
    if(!username || !email || !password ) {
        return res.status(400).send("All fields required");
    }
    if(!validator.isEmail(email.trim())) {
        return res.status(400).send("Valid EMAIL needed");
    }
    next();
}

module.exports.authorityValidation = (req,res,next) => {
    let {authorityname,authorityemail,password} = req.body || {};
    if(!authorityname || !authorityemail || !password ) {
        return res.status(400).send("All fields required");
    }
    if(!validator.isEmail(authorityemail.trim())) {
        return res.status(400).send("Valid EMAIL needed");
    }
    next();
}