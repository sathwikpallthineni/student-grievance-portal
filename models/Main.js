const mongoose = require("mongoose");
const Grievance = require("./grievance");
const passportLocalMongoose = require('passport-local-mongoose');
const { ref } = require("process");
const { type } = require("os");

const trackingschema = new mongoose.Schema({
    email:{
        type:String,
    },
    role: {
        type:String,
        required:true,
    },
    grievances:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Grievance",
            default: []
        },
    ],
    status:{
        type:String,
    },
    refresh_token:{
        type:String,
    }
});
trackingschema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("Tracking",trackingschema);