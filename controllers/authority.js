const Tracking = require("../models/Main");
const Grievance = require("../models/grievance");
const mongoose = require("mongoose");
const transporter = require("../utils/email");

module.exports.authorityHomePage = async(req,res,next) => {
    try{
        if(!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).send("INVALID Grievance ID.")
    }
    let authority = await Tracking.findById(req.user.id).populate("grievances");
    if(!authority) {
       return res.status(404).send("Authority not found");
    }
    let datas = authority.grievances;
    let {filter} = req.query;
    let grievances = [];
    if(!filter || filter === "All"){
        grievances.push(...datas);
    }
    if(filter === "In Progress" || filter === "Under Review") {
        let a = datas.filter((el) => {
            return el.status == filter;
        });
            grievances.push(...a);
    }
    
    if(filter === "At Risk") {
        for(let data of datas) {
            if(data.status != "Resolved" && Date.now() < data.duedate && Date.now() > data.duedate-(24*60*60*1000)){
                grievances.push(data);
            }
        }
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
    if(filter === "currentBreached"){
        let a = datas.filter((el) => {
            return (el.status != "Resolved" && el.duedate < Date.now())
        });
        grievances.push(...a);
    }
    res.render("authority.ejs",{grievances,authority,datas,title:"Authority Dashboard | Grievance Portal"});
   }catch(err){
    next(err);
   }
    
}


module.exports.authorityActions = async(req,res,next) => {
     try{
        let {action,id} = req.params;
        // console.log(req.body);
        let {action_note} = req.body || {};
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("INVALID Grievance ID.")
    }
    let grievance = await Grievance.findById(id);
    if(!grievance) {
       return res.status(404).send("Grievance not found");
    }
    let User = await Tracking.findOne({role:"user" , username:grievance.raised_By});

    let Email;
    let subject;
    if(action === "MarkProgress"){
        if(grievance.status != "Under Review") {
            return res.status(402).send(`You can mark inprogress only from underReview`);
        }
        grievance.status = "In Progress";
        grievance.history.push({
            status:"In Progress",
            done_By:grievance.assigned_To,
        });

        grievance.Notes.Progress_Note = action_note;

        subject = `Grievance In Progress – ID #${grievance._id}`;
         Email = `
Your grievance is now in progress.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Assigned Authority: ${grievance.assigned_To}
- Status: In Progress
- Updated On: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        })}
The assigned authority is actively working on your grievance.
You will be notified once it has been resolved.

This is an automated message. Please do not reply.
`;
    }

    if(action === "MarkResolved"){
        if(grievance.status != "In Progress") {
            return res.status(402).send(`You can mark resolve only from inprogress`);
        }
        grievance.status = "Resolved";
        if(grievance.duedate > Date.now()){
            grievance.slaStatus = "On Track";
        }
        if(grievance.duedate < Date.now()){
            grievance.slaStatus = "Breached";
        }

        grievance.history.push({
            status:"Resolved",
            done_By:grievance.assigned_To,
        });

         grievance.Notes.Resolved_Note = action_note;

        subject = `Grievance Resolved – ID #${grievance._id}`;

        Email = `
Your grievance has been marked as resolved.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Resolved By: ${grievance.assigned_To}
- Resolution Date: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        })}

If the issue is not fully resolved, please log in and raise a follow-up.

This is an automated message. Please do not reply.
`;
    }

    await grievance.save();
    console.log(grievance);

    if(User && User.email){

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: User.email,
        subject: subject,
        text: Email,
    })
    .then(info => console.log("User email sent:", info.response))
  .catch(err => console.log("User email error:", err.message));

}
req.flash("success",`Marked as ${grievance.status}`);
  res.redirect(`/authority/${id}`);
   }catch(err){
    next(err);
   }
    
}

module.exports.authorityViewPage = async(req,res,next) => {
    try{
        let {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("INVALID Grievance ID.")
    }
    let grievance = await Grievance.findById(id);
    if(!grievance) {
       return res.status(404).send("Grievance not found");
    }
    let authority = await Tracking.findOne({username:grievance.assigned_To});
    let grievanceHistories = grievance.history;
    res.render("authorityview.ejs",{grievance,grievanceHistories,authority,title:"Review Grievance | Authority Panel"});
   }catch(err){
    next(err);
   }
}