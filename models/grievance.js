const mongoose = require("mongoose");
const { type } = require("os");

const grievanceschema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    file_Url:{
        type:String,
    },
    raised_By:{
        type:String,
        required:true,
    },
    assigned_To:{
        type:String,
    },
    status:{
        type:String,
    },
    slaStatus:{
        type:String,
    },
    Notes:{
        Progress_Note:{
            type:String,
        },
        Resolved_Note:{
            type:String,
        }
    },
    duedate:{
        type:Number,
    },
    assignedtoHistory:[
        {
            authority_from:{
                type:String,
            },
            authority_to:{
                type:String,
            },
            time:{
                type:Date,
                default:Date.now,
            },

        },
    ],
    history: [
        {
            status:{
                type:String,
                required:true,
            },
            done_By:{
                type:String,
                required:true,
            },
            time:{
                type: Date,
                default: Date.now,
            }
            
        }
    ]
    
},
{timestamps:true},
);

const Grievance = mongoose.model("Grievance",grievanceschema);

module.exports = Grievance;