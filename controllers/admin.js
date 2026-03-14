const Tracking = require("../models/Main");
const Grievance = require("../models/grievance");
const mongoose = require("mongoose");
const transporter = require("../utils/email");
const { title } = require("process");


module.exports.adminAtRiskDataFetch = async(req,res,next) => {
    try{
         let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    let skip = (page-1) * limit;
    let now = Date.now();
    let tommrow = Date.now()+(24*60*60*1000);
    let count = await Grievance.find({slaStatus:{$ne:"Resolved"},duedate:{$gt:now,$lt:tommrow}}).countDocuments();
    let data = await Grievance.find({slaStatus:{$ne:"Resolved"},duedate:{$gt:now,$lt:tommrow}}).skip(skip).limit(limit);
    let total = Math.ceil(count/limit);
    res.json({
        data:data,
        totalpages:total,
    });
    }catch(err){
        next(err);
    }

}


module.exports.adminHomePage = async(req,res,next) => {
    try{
        let user = await Tracking.findById(req.user.id);
    let grievances = await Grievance.find();
    let a = 0;
    let b=0;
    let c=0;
    let onTrack = 0;
    let atRisk = 0;
    let breached = 0;
    for(let grievance of grievances) {
        if(Date.now() < grievance.duedate && Date.now() < grievance.duedate - 24*60*60*1000){
            onTrack++;
        }
        if(Date.now() < grievance.duedate && Date.now() > grievance.duedate - 24*60*60*1000){
            atRisk++;
        }
        if(grievance.status != "Resolved" && Date.now() > grievance.duedate){
            breached++;
        }                   
        if(grievance.status === "Submitted") {
            a++;
        }
        if(grievance.status == "In Progress") {
            b++;
        }
        if(grievance.status == "Resolved") {
            c++;
        }
    }
    let grievancesUnassigned = a;
    let grievancesInprogress = b;
    let grievancesResolved = c;
    res.render("admin.ejs",{grievances,user,grievancesUnassigned,grievancesInprogress,grievancesResolved,onTrack,atRisk,breached,title:"Admin Dashboard | Grievance Portal"});

    }catch(err){
        next(err);
    }

    }


module.exports.adminAuthorityDataFetch = async(req,res,next) => {
    try{
         let limit = parseInt(req.query.limit, 10);
   let page = parseInt(req.query.page, 10);
   let skip = (page-1)*limit;
   let count = await Tracking.countDocuments({role:"Authority"});
   let data = await Tracking.find({role:"Authority"}).skip(skip).limit(limit).populate("grievances");
   let total = Math.ceil(count/limit);
   res.json({
    data:data,
    totalpages:total,
   });
    }catch(err){
        next(err);
    }
    
}


module.exports.adminAuthorityPage = async(req,res,next) => {
    try{
         let authorities = await Tracking.find({role:"Authority"});
    if(!authorities) {
       return res.status(404).send("Authorities not found");
    }
    res.render("authorities.ejs",{authorities,title:"Authority Management | Admin Panel"});
    }catch(err){
        next(err);
    }
}


module.exports.adminNewAuthorityPage = (req,res,next) => {
    try{
        res.render("newAuthority.ejs",{title:"Create Authority | Admin Panel"});
    }catch(err){
        next(err);
    }
}


module.exports.adminCreatingNewAuthority = async(req,res,next) => {
    try{
        let {authorityname,authorityemail,password,status} = req.body;
    let authority = new Tracking({
        username:authorityname,
        email:authorityemail,
        role:"Authority",
        status:status,
    });
    await Tracking.register(authority,password);
    res.redirect("/admin/authority");
    }catch(err){
        next(err);
    }
}


module.exports.adminAssignDataFetch = async(req,res,next) => {
    try{
        let limit = parseInt(req.query.limit, 10);
   let page = parseInt(req.query.page, 10);
   let skip = (page-1)*limit;
   let count = await Grievance.find({status:"Submitted"}).countDocuments();
   let grievances = await Grievance.find({status:"Submitted"}).sort({createdAt:(-1)}).skip(skip).limit(limit);
   let total = Math.ceil(count/limit);
   res.json({
    data:grievances,
    totalpages:total,
   });
    }catch(err){
        next(err);
    }
}


module.exports.adminAssignmentPage = async(req,res,next) => {
    try{
         let authorities = await Tracking.find({$and:[{role:"Authority"},{status:"Active"}]}).populate("grievances");
    if(!authorities) {
       return res.status(404).send("authorities not found");
    }
    res.render("assignment.ejs",{authorities,title:"Unassigned Grievances | Admin Panel"});
    }catch(err){
        next(err);
    }
}


module.exports.adminReassignDataFetch = async(req,res,next) => {
    try{
        let limit = parseInt(req.query.limit, 10);
   let page = parseInt(req.query.page, 10);
   let skip = (page-1)*limit;
   let count = await Grievance.find({$and:[{status:{$ne:"Resolved"}},{duedate:{$lt: Date.now()-(24*60*60*1000)}}]}).countDocuments();
   let data = await Grievance.find({$and:[{status:{$ne:"Resolved"}},{duedate:{$lt: Date.now()-(24*60*60*1000)}}]}).sort({createdAt:(-1)}).skip(skip).limit(limit);
let total = Math.ceil(count/limit);
res.json({
    data:data,
    totalpages:total,
});
    }catch(err){
        next(err);
    }

}


module.exports.adminReassignPage = async(req,res,next) => {
    try{
         
    let authorities = await Tracking.find({$and:[{role:"Authority"},{status:"Active"}]}).populate("grievances");
    if(!authorities) {
       return res.status(404).send("authorities not found");
    }
   res.render("reassign.ejs",{authorities,title:"SLA Breached Grievances | Admin Panel"});
    }catch(err){
        next(err);
    }
}

module.exports.adminAllGrievancesDataFetch = async(req,res,next) => {
    try{
         let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    let {filter} = req.query;
    let skip = (page-1) * limit;
    let count;
    let grievances = [];
    if(filter=="undefined" || filter==="All") {
        count = await Grievance.countDocuments();
        let data = await Grievance.find().sort({createdAt:(-1)}).skip(skip).limit(limit);
        grievances.push(...data);
    }
    if(filter && ["Under Review","In Progress"].includes(filter)) {
        count= await Grievance.find({status:filter}).countDocuments();
        let data = await Grievance.find({status:filter}).sort({createdAt:(-1)}).skip(skip).limit(limit);
        grievances.push(...data);
    }
    if(filter && ["On Track","Breached"].includes(filter)) {
        count = await Grievance.find({slaStatus:filter}).countDocuments();
        let data = await Grievance.find({slaStatus:filter}).sort({createdAt:(-1)}).skip(skip).limit(limit);
        grievances.push(...data);
    }
    if(filter === "Current Breached") {
        count = await Grievance.countDocuments({status:{$ne:"Resolved"},duedate:{$lt:Date.now()}});
        let data = await Grievance.find({status:{$ne:"Resolved"},duedate:{$lt:Date.now()}}).sort({createdAt:(-1)}).skip(skip).limit(limit);
        grievances.push(...data);
    }
    if(filter === "At Risk") {
        count = await Grievance.countDocuments({status:{$ne:"Resolved"},duedate:{$gt:Date.now(),$lt:Date.now()+(24*60*60*1000)}});
        let data = await Grievance.find({status:{$ne:"Resolved"},duedate:{$gt:Date.now(),$lt:Date.now()+(24*60*60*1000)}}).sort({createdAt:(-1)}).skip(skip).limit(limit);
        grievances.push(...data);
    }
    let total = Math.ceil(count/limit);
     res.json({
        data:grievances,
        totalpages:total,
    });
    }catch(err){
        next(err);
    }
}


module.exports.adminAllGrievancesPage = async(req,res,next) => {
    try{
        let grievances = await Grievance.find();
    let a = 0;
    let b=0;
    let c=0;
    for(let grievance of grievances) {
        if(grievance.status === "submitted") {
            a++;
        }
        if(grievance.status == "In Progress") {
            b++;
        }
        if(grievance.status == "Resolved") {
            c++;
        }
    }
    let grievancesUnassigned = a;
    let grievancesInprogress = b;
    let grievancesResolved = c;
    
    res.render("Allgrievances.ejs",{grievances,grievancesUnassigned,grievancesInprogress,grievancesResolved,title:"All Grievances | Admin Panel"});
    }catch(err){
        next(err);
    }
}


module.exports.adminUsersDataFetch = async(req,res,next) => {
    try{
         let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    let skip = (page-1) * limit;
    let count = await Tracking.countDocuments({role:"user"});
    let data = await Tracking.find({role:"user"}).skip(skip).limit(limit).populate("grievances");
    let total = Math.ceil(count/limit);
    res.json({
        data:data,
        totalpages:total,
    });
    }catch(err){
        next(err);
    }
}


module.exports.adminUsersPage = async(req,res,next) => {
    try{
        let users = await Tracking.find({role:"user"});
    let grievances = await Grievance.find();
    let openGrievances = 0;
    res.render("allUsers.ejs",{users,grievances,openGrievances,title:"User Management | Admin Panel"});
    }catch(err){
        next(err);
    }
}


module.exports.adminUserBlock = async(req,res,next) => {
    try{
        let {id} = req.params;
    let person = await Tracking.findById(id).populate("grievances");
    if(person.role === "user"){
        await Tracking.findOneAndUpdate({username:person.username},{$set:{status:"Blocked"}});
        const userBlockEmail = `
Your account has been temporarily restricted.

During this period, you will not be able to submit new grievances or track existing ones.

If you believe this action was taken in error, please contact support.

This is an automated message. Please do not reply.
`;
        if(person.email){
        await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:person.email,
        subject:'Account Temporarily Restricted',
        text:userBlockEmail,
    });
    }
    
    res.redirect("/admin/users");
    }

    if(person.role === "Authority"){
        await Tracking.findOneAndUpdate({username:person.username},{$unset:{grievances:""},$set:{status:"Blocked"}});
        await Grievance.updateMany({assigned_To:person.username,status:{$ne:"Resolved"}},{$unset:{assigned_To:"",duedate:""},$set:{status:"Submitted"}});

    const authBlockEmail = `Your account has been temporarily restricted.

During this period, your all assigned grievances will be unassigned.

If you believe this action was taken in error, please contact support.

This is an automated message. Please do not reply.
`;
    if(person.email){
        await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:person.email,
        subject:'Account Temporarily Restricted',
        text:authBlockEmail,
    });
    }
        
    res.redirect("/admin/authority");
    }  
    }catch(err){
        next(err);
    }
    
}


module.exports.adminUserUnblock = async(req,res,next) => {
    try{
        let {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("INVALID Grievance ID.");
    }
    let person = await Tracking.findById(id);
    if(!person) {
        return res.status(404).send("not found");
    }
    person.status = "Active";
    await person.save();
    const personUnblockEmail = `
Your account access has been restored.

You may now log in and continue using the grievance portal.

If you experience any issues, please contact support.

This is an automated message. Please do not reply.
`;
    if(person.email) {
         await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:person.email,
        subject:'Account Access Restored',
        text:personUnblockEmail, 
    });
    }
    if(person.role === "user"){
        res.redirect("/admin/users");
    }
    if(person.role === "Authority"){
        res.redirect("/admin/authority");
    }
    
    }catch(err){
        next(err);
    }
    
}

module.exports.adminReassigningGrievance = async(req,res,next) => {
    try{
        let {id} = req.params;
    let {authority} = req.body || {};
    let auth = await Tracking.findOne({username:authority});
    if (!auth) {
    return res.status(404).send("Authority account not found.");
    }
    let count = await Grievance.countDocuments({status:{$ne:"Resolved"},assigned_To:auth.username});
    if(count >= 10) {
        return res.status(403).send("Assignment limit reached. An authority cannot handle more than 10 active grievances.");
    }
    let grievance = await Grievance.findById(id);
    let User = await Tracking.findOne({role:"user" , username:grievance.raised_By});

    assignedhistory = grievance.assignedtoHistory;
    let a = (assignedhistory.length>0 ? assignedhistory.at(-1).authority_to:null);
    let previousAuthority;
    if(a) {
       previousAuthority = await Tracking.findOne({username:a});
    }
    if(grievance.category === "academic") {
        grievance.duedate = Date.now() + 7*24*60*60*1000;
    }
    else if(grievance.category === "hostel") {
        grievance.duedate = Date.now() + 3*24*60*60*1000;
    }
    else if(grievance.category === "administration") {
        grievance.duedate = Date.now() + 3*24*60*60*1000;
    }
    else if(grievance.category === "transport") {
         grievance.duedate = Date.now() + 2*24*60*60*1000;
    }
    else if(grievance.category === "infrastructure") {
        grievance.duedate = Date.now() + 4*24*60*60*1000;
    }
    else{
        grievance.duedate = Date.now() + 7*24*60*60*1000;
    }
    await grievance.save();
    let b = await Grievance.findByIdAndUpdate(id,{$set:{assigned_To:authority,status:"Under Review"},$push:{assignedtoHistory:{authority_from:a,authority_to:authority,}}});
    await Tracking.findOneAndUpdate({username:authority},{$push:{grievances:grievance}});
    let dueDate = new Date(grievance.duedate);
    let formattedDueDate = dueDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const authReassignEmail = `
A grievance has been reassigned to you.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Raised By: ${grievance.raised_By}
- Deadline: ${formattedDueDate}

Please log in to review and take necessary action.
`;

const userReassignEmail = `
Your grievance has been reassigned to a different authority.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- New Authority: ${auth.username}

The newly assigned authority will review your grievance and update the status soon.

You can track updates by logging into the portal.

This is an automated message. Please do not reply.
`;
    if(User.email){
        await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:User.email,
        subject:`Your Grievance Has Been Reassigned – ID #${grievance._id}`,
        text:userReassignEmail,
    });
    }
    
    if(auth.email){
        await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:auth.email,
        subject:`Grievance Reassigned – ID #${grievance._id}`,
        text:authReassignEmail,
    });
    }
    
    if(previousAuthority && previousAuthority.email){
        const previousAuthEmail = `
The following grievance has been reassigned and is no longer under your responsibility.

Details:
- Grievance ID: ${grievance._id}
- Category: ${grievance.category}
- Reassigned To: ${newAuth.username}
- Reassigned On: ${assignedOn}

You are no longer required to take action on this grievance.

If you have already made updates, they remain recorded in the system.

This is an automated message. Please do not reply.
`;

        await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:previousAuthority.email,
        subject:'Grievance Reassigned – ID #${grievance._id}',
        text:previousAuthEmail,
    });
    }
    
    res.redirect("/admin/reassign");
    }catch(err){
        next(err);
    }
    
}


module.exports.adminAssigningGrievance = async(req,res,next) => {
    try{
        let {authority} = req.body || {};
    let {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status().send("INVALID Grievance ID.");
    }
    let grievance = await Grievance.findById(id);
    if(!grievance) {
        return res.status(404).send("grievance not found");
    }
    let auth = await Tracking.findOne({role:"Authority",username:authority});
    if(!auth) {
        return res.status(404).send("grievance not found");
    }
    auth.grievances.push(grievance);

    let User = await Tracking.findOne({role:"user" , username:grievance.raised_By});
    grievance.assigned_To = authority;
    grievance.status = "Under Review";
    grievance.history.push({status:"Under Review",done_By:authority});
    grievance.assignedtoHistory.push({authority_from:null,authority_to:authority});

    if(grievance.category === "academic") {
        grievance.duedate = Date.now() + 7*24*60*60*1000;
    }
    else if(grievance.category === "hostel") {
        grievance.duedate = Date.now() + 3*24*60*60*1000;
    }
    else if(grievance.category === "administration") {
        grievance.duedate = Date.now() + 3*24*60*60*1000;
    }
    else if(grievance.category === "transport") {
         grievance.duedate = Date.now() + 2*24*60*60*1000;
    }
    else if(grievance.category === "infrastructure") {
        grievance.duedate = Date.now() + 4*24*60*60*1000;
    }
    else{
        grievance.duedate = Date.now() + 7*24*60*60*1000;
    }
  
    await auth.save();
    await grievance.save();


    let dueDate = new Date(grievance.duedate);
    let formattedDueDate = dueDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const authEmail = `
             A new grievance has been assigned to you.

           Details:
             - Grievance ID: ${grievance._id}
            - Category: ${grievance.category}
            - Raised By: ${grievance.raised_By}
            - Deadline: ${formattedDueDate}

        Please log in to the portal to review the grievance.`;

    const userEmail = `Your grievance has been successfully assigned to the ${grievance.assigned_To}.

          Grievance ID: ${grievance._id}
         Category: ${grievance.category}
         Assigned To: ${grievance.assigned_To}
         Assigned On: ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
        })}
         

The authority will review your grievance and update the status soon.
You can track updates by logging into the portal.

This is an automated message. Please do not reply.`

if(User.email){
     await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: User.email,
        subject: "Your Grievance Has Been Assigned",
        text: userEmail,
});
}
if(auth.email){
await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: auth.email,
        subject: `New Grievance Assigned – ID #${grievance._id}`,
        text: authEmail,
});
}
    res.redirect("/admin/assign");
    }catch(err){
        next(err);
    }
}