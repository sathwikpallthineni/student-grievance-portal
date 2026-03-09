const express = require("express");
let router = express.Router();
const {adminRole} = require("../middlewares/roleCheck");
const Tracking = require("../models/Main");
const Grievance = require("../models/grievance");
let {authorityValidation} = require("../middlewares/validation");
let {authenticate} = require("../middlewares/authenticate");
const adminController = require("../controllers/admin");




router.get("/adminfetch",adminController.adminAtRiskDataFetch);
router.get("/",authenticate,adminRole,adminController.adminHomePage); 
router.get("/status",authenticate,adminRole,async(req,res) => {
    let {status} = req.query;
    let grievances = [];
    if(status === "In Progress" || status === "Resolved"){
        let data = await Grievance.find({status:status});
        grievances.push(...data);
    }
    if(status === "Breached") {
        let j = await Grievance.find();
        for(i of j) {
            if(!i.slaStatus || i.slaStatus === "Breached"){
                if(Date.now() > i.duedate) {
                    grievances.push(i);
                }
            }
        }
    }
    res.render("status.ejs",{grievances});
});
router.get("/authoritiesfetch",adminController.adminAuthorityDataFetch);

router.get("/authority",authenticate,adminRole,adminController.adminAuthorityPage);

router.get("/newAuhtority",authenticate,adminRole,adminController.adminNewAuthorityPage);

router.post("/",authenticate,adminRole,authorityValidation,adminController.adminCreatingNewAuthority);

router.get("/assignfetch",adminController.adminAssignDataFetch);

router.get("/assign",authenticate,adminRole,adminController.adminAssignmentPage);

router.get("/reassignfetch",adminController.adminReassignDataFetch);

router.get("/reassign",authenticate,adminRole,adminController.adminReassignPage);
 
router.get("/grievancesfetch",adminController.adminAllGrievancesDataFetch);

router.get("/grievances",authenticate,adminRole,adminController.adminAllGrievancesPage);

router.get("/usersfetch",adminController.adminUsersDataFetch);

router.get("/users",authenticate,adminRole,adminController.adminUsersPage);

router.post("/block/:id",authenticate,adminRole,adminController.adminUserBlock);

router.post("/unblock/:id",authenticate,adminRole,adminController.adminUserUnblock);

router.post("/reassign/:id",authenticate,adminRole,adminController.adminReassigningGrievance);

router.post("/:id",authenticate,adminRole,adminController.adminAssigningGrievance);

module.exports = router;