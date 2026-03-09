    let btns = document.querySelectorAll(".items");
    for(let btn of btns) {
        btn.addEventListener("click",() => {
            for(let b of btns){
                b.classList.remove("activ");
            }
            btn.classList.add("activ");
        })
    }

    let assignBtns = document.querySelectorAll(".toggle");
    let backdrop = document.querySelectorAll(".backdrop");
    let overlay = document.querySelector(".overlay");
    let form = document.querySelector(".form");
    let cancelBtn = document.querySelector(".cancel-btn");
    let blockbtns = document.querySelectorAll(".block-btn");
    let Unblockbtns = document.querySelectorAll(".unblock-btn");
    let confirmOverlay = document.querySelector(".confirm-overlay");
    let blockForm = document.querySelector(".block-form");
    let warningText = document.querySelector(".warning-text");
    let dangerBtn = document.querySelector(".danger-btn");
    let logout_icon = document.querySelector(".logout-icon");
    let logout_warning = document.querySelector(".logout-warning");
    let logout_cancelbtn = document.querySelector(".logout-cancelbtn");
    let logout_overlay = document.querySelector(".logout-overlay");
    let authority_action = document.querySelector(".authority-action");
    let authorityaction_cancelbtn = document.querySelector(".authorityaction-cancelbtn");
    let authorityaction_warning = document.querySelector(".authorityaction-warning");
    let authorityaction_overlay = document.querySelector(".authorityaction-overlay");
    let authorityaction_form = document.querySelector(".authorityaction-form");
    let authorityaction_button = document.querySelector(".authorityaction-button");
    let status_text = document.querySelector(".status-text");
    let assignment_overlay = document.querySelector(".assignment-overlay");
    let profile_pic = document.querySelector(".profile-pic");
    let confirmoverlay_cancelbtn = document.querySelector(".confirmoverlay-cancelbtn");
    let flashCloseBtns = document.querySelectorAll(".flash-close");

    function toggleProfile(){
  const popup = document.getElementById("profilePopup");
  popup.style.display = "flex";
}

let popup = document.getElementById("profilePopup");
if(popup){
    popup.addEventListener("click", function(e){
  if(e.target.id === "profilePopup"){
    this.style.display = "none";
  }
});

}

if(logout_icon){
    logout_icon.addEventListener("click",() => {
        logout_overlay.style.display = "block";
        logout_warning.style.display = "block";
    });
    logout_cancelbtn.addEventListener("click",() => {
        logout_overlay.style.display = "none";
        logout_warning.style.display = "none";
    });
}

    if(authority_action){
        authority_action.addEventListener("click",() => {
        authorityaction_overlay.style.display = "block";
        authorityaction_warning.style.display = "block";
        let id = authority_action.getAttribute("id");
        authorityaction_button.innerText = (id.includes("MarkProgress")?"Yes, Mark as InProgress":"Yes, Mark as Resolved");
        status_text.innerText = (id.includes("MarkProgress")?"InProgress":"Resolved");
        authorityaction_button.style.backgroundColor = (id.includes("MarkProgress")?"#2563eb":"#16a34a");
        authorityaction_form.setAttribute("action",`/authority/${id}`);
    });
    authorityaction_cancelbtn.addEventListener("click",() => {
        authorityaction_overlay.style.display = "none";
        authorityaction_warning.style.display = "none";
    });
    }
    if(confirmoverlay_cancelbtn){
         confirmoverlay_cancelbtn.addEventListener("click",() => {
         confirmOverlay.style.display = "none";
    })
    }
    if(flashCloseBtns) {
        
flashCloseBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.remove();
  });
});
}
   

    document.addEventListener("click",(e) => {
        if(e.target.matches(".toggle")) {
            assignment_overlay.style.display = "block";
            overlay.style.display = "block";
            let grievanceid = e.target.id;
            form.action = `/admin/${grievanceid}`;
        }
    });
    let reassignbtns = document.querySelectorAll(".reassign");

        document.addEventListener("click", function (e) {

        if (e.target.matches(".reassignbtn")) {
        assignment_overlay.style.display = "block";
         overlay.style.display = "block";
        const grievanceid = e.target.id;
         form.action = `/admin/reassign/${grievanceid}`;
        }

        if(e.target.closest(".block-btn")){
        confirmOverlay.style.display = "block";
        confirmOverlay.classList.add("show");
        let id = e.target.id;
        blockForm.setAttribute("action",`/admin/block/${id}`);
        warningText.innerText = "This user has active grievances.Disabling will restrict access but will not delete existing records.";
        dangerBtn.innerText = "Disable";
        }

        if(e.target.closest(".unblock-btn")){
        confirmOverlay.style.display = "block";
        confirmOverlay.classList.add("show");
        let id =  e.target.id;
        blockForm.setAttribute("action",`/admin/unblock/${id}`);
        warningText.innerText = "This will restore the access to the system.They will be able to log in";
        dangerBtn.innerText = "unblock";
        }

       });
    
    if(cancelBtn){
        cancelBtn.addEventListener("click",() => {
        overlay.style.display = "none";
         assignment_overlay.style.display = "none";
    });
    }
    
    


    //allgrievance panigations

let allgrievances = document.querySelector("#allgrievances");
    let filters = document.querySelectorAll(".filter");

function renderGrievances(grievances) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr><th>Grievance ID</th> <th>User</th> <th>Status</th> <th>Assigned To</th> <th>SLA Status</th> <th>Created At</th></tr>"
    if(grievances.length <=0) {
        table.innerHTML+= "<tr><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>"
    }
    for(let grievance of grievances) {
        let row = document.createElement("tr");
        row.innerHTML = 
        `
        <td>${grievance._id}</td>
        <td>${grievance.raised_By}</td>
        <td><div class= "grievance-status ${(grievance.status==="Under Review"?"status-review":grievance.status==="In Progress"?"status-progress":grievance.status==="Resolved"?"status-resolved":"status-new")}">${grievance.status}</div></td>
        <td>${(grievance.assigned_To?grievance.assigned_To:"Un-Assigned")}</td>
        <td>${(!grievance.assigned_To? "--":grievance.slaStatus && grievance.slaStatus === "Resolved"?`<div class="sla-badge sla-ontrack"> ${grievance.slaStatus}</div>`:grievance.slaStatus && grievance.slaStatus != "Resolved"?`<div class="sla-badge sla-breached"> ${grievance.slaStatus}</div>`: Date.now()<(grievance.duedate-(24*60*60*1000))?`<div class="sla-badge sla-ontrack">On-Track</div>`:Date.now()<grievance.duedate && Date.now()>(grievance.duedate-(24*60*60*1000))?`<div class="sla-badge sla-risk">At-Risk</div>`:`<div class="sla-badge sla-breached">Breached</div>`)}</td>
        <td>${new Date(grievance.createdAt).toLocaleString("en-IN") }</td>
        `
        table.appendChild(row);
    }
}

function renderReassign(grievances) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr><th>Grievance ID</th> <th>User</th> <th>Created At</th> <th>Age</th> <th>Overdue</th> <th>Action</th> </tr>";
    if(grievances.length <=0) {
        table.innerHTML+= "<tr> <td>--</td> <td>--</td> <td>--</td> <td>--</td> <td>--</td> <td>--</td></tr>"
    }
    for(let grievance of grievances){
        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${grievance._id}</td>
        <td>${grievance.raised_By}</td>
        <td>${new Date(grievance.createdAt).toLocaleString("en-IN") }</td>
        <td>${Math.floor((Date.now() - new Date(grievance.createdAt).getTime()) / (24*60*60*1000) )} Days</td>
        <td><i class="fa-solid fa-triangle-exclamation" style="color: red;"></i> ${Math.floor((Date.now() - new Date(grievance.duedate).getTime()) / (60*60*1000) )} Hours</td>
        <td>
            <div class="assign-btn">
                <b id="${grievance._id}" class="reassignbtn">Reassign</b>
            </div>
        </td>
        `
        table.appendChild(row);
    }
}

function renderAssign(grievances) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr><th>Grievance ID</th> <th>User</th> <th>Created At</th> <th>Age</th> <th>Action</th> </tr>";
    if(grievances.length <=0) {
        table.innerHTML+= "<tr> <td>--</td> <td>--</td> <td>--</td> <td>--</td> <td>--</td></tr>"
    }
    for(let grievance of grievances){
        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${grievance._id}</td>
        <td>${grievance.raised_By}</td>
        <td>${new Date(grievance.createdAt).toLocaleString("en-IN") }</td>
        <td>${Math.floor((Date.now() - new Date(grievance.createdAt).getTime()) / (24*60*60*1000) )} Days</td>
        <td>
            <div class="assign-btn">
                <b id="${grievance._id}" class="toggle">assign</b>
            </div>
        </td>
        `
        table.appendChild(row);
    }
}

function renderAtrisk(grievances) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr><th>Grievance ID</th> <th>Raised By</th>  <th>Assigned To</th> <th>Status</th> <th>Time Left</th> <th>SLA Status</th> </tr>"
    if(grievances.length <=0) {
        // let atrisk_table = document.querySelector(".risk-table");
        // let header = document.createElement("p");
        // header.innerText = "No Grievances Found";
        // header.classList.add("no-grievances");
        // atrisk_table.insertAdjacentElement("beforebegin",header);
        table.innerHTML+= "<tr><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>"
    }
    for(let grievance of grievances) {
        let row = document.createElement("tr");
        row.innerHTML = 
        `
        <td>${grievance._id}</td>
        <td>${grievance.raised_By}</td>
        <td>${(grievance.assigned_To?grievance.assigned_To:"Un-Assigned")}</td>
        <td><div class= "grievance-status ${(grievance.status==="Under Review"?"status-review":grievance.status==="In Progress"?"status-progress":grievance.status==="Resolved"?"status-resolved":"status-new")}">${grievance.status}</div></td>
        <td>${Math.floor((grievance.duedate - Date.now())/(60*60*1000))} hours</td>
        <td>${(grievance.slaStatus?`<div class="sla-badge sla-ontrack"> ${grievance.slaStatus}</div>`: Date.now()<(grievance.duedate-(24*60*60*1000))?`<div class="sla-badge sla-ontrack">On-Track</div>`:Date.now()<grievance.duedate && Date.now()>(grievance.duedate-(24*60*60*1000))?`<div class="sla-badge sla-risk">At-Risk</div>`:`<div class="sla-badge sla-breached">Breached</div>`)}</td>
        `
        table.appendChild(row);
    }
}

function renderUsers(users) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr> <th>User ID</th> <th>Username</th>  <th>Total Grievances</th> <th>Open Grievances</th> <th>Status</th> <th>Action</th> </tr>";

    for(let user of users) {
        let row = document.createElement("tr");
        let usergrievances = user.grievances;
        let opengrievances = usergrievances.filter((el) => {
            return el.status != "Resolved"
        });
        row.innerHTML = 
        `
        <td>${user._id}</td>
        <td>${user.username}</td>
        <td>${user.grievances.length}</td>
        <td>${opengrievances.length}</td>
        <td><div class="user-status ${(user.status === "Active"? "status-active":"status-inactive")}">${user.status}</div></td>
        <td>
        <div  class="${(user.status != "Blocked"? "block-btn":"unblock-btn")}">
            <a id="${user._id}" >${(user.status != "Blocked"? "Block":"Unblock")}</a>
        </div>
        </td>
        `
        table.appendChild(row);
    }
}
function renderAuthorities(authorities) {
    let table = document.querySelector("table");
    table.innerHTML = "";
    table.innerHTML = "<tr> <th>User ID</th> <th>Username</th>  <th>Total Grievances</th> <th>Open Grievances</th> <th>Status</th> <th>Action</th> </tr>";
    // if(users<= 0) {

    // }
    for(let authority of authorities) {
        let authoritygrievances = authority.grievances;
        let opengrievances = authoritygrievances.filter((el) => {
            return el.status != "Resolved"
        });
        let row = document.createElement("tr");
        row.innerHTML = 
        `
        <td>${authority._id}</td>
        <td>${authority.username}</td>
        <td>${authority.grievances.length}</td>
        <td>${opengrievances.length}</td> 
        <td><div class="user-status ${(authority.status === "Active"? "status-active":"status-inactive")}">${authority.status}</div></td>
        <td>
        <div  class="${(authority.status != "Blocked"? "block-btn":"unblock-btn")}">
            <a id="${authority._id}" >${(authority.status != "Blocked"? "Block":"Unblock")}</a>
        </div>
        </td>
        `
        table.appendChild(row);
    }
}

function renderbtns(totalpages,filter) {
    let container = document.querySelector(".btn-container");
    container.innerHTML = "";
    for(let i=1;i<=totalpages;i++){
        let btn = document.createElement("button");
        btn.innerText = i;
        btn.addEventListener("click",() => {
            loadpage(i,filter);
        });
        container.appendChild(btn);
    }
    }

async function loadpage(page,filter) {
    let res;
    if(window.location.pathname === "/admin/grievances"){
        res = await fetch(`/admin/grievancesfetch?page=${page}&limit=8&filter=${filter}`);
        let json = await res.json();
    renderGrievances(json.data);
    renderbtns(json.totalpages,filter);
    }

    if(window.location.pathname === "/admin/reassign"){
        res = await fetch(`/admin/reassignfetch?page=${page}&limit=8`);
        let json = await res.json();
        renderReassign(json.data);
        renderbtns(json.totalpages);
    }
    
    if(window.location.pathname === "/admin/assign"){
        res = await fetch(`/admin/assignfetch?page=${page}&limit=8`);
        let json = await res.json();
       renderAssign(json.data);
       renderbtns(json.totalpages,filter);
    }

    


    if(window.location.pathname === "/admin"){
        res = await fetch(`/admin/adminfetch?page=${page}&limit=8`);
        let json = await res.json();
       renderAtrisk(json.data);
       renderbtns(json.totalpages,filter);
    }

    if(window.location.pathname === "/admin/status"){
        res = await fetch(`/admin/statusfetch?page=${page}&limit=8`);
        let json = await res.json();
       renderAtrisk(json.data);
       renderbtns(json.totalpages,filter);
    }

    if(window.location.pathname === "/admin/users") {
        res = await fetch(`/admin/usersfetch?page=${page}&limit=8`);
        let json = await res.json();
        renderUsers(json.data);
        renderbtns(json.totalpages,filter);
    }
    if(window.location.pathname === "/admin/authority") {
        res = await fetch(`/admin/authoritiesfetch?page=${page}&limit=8`);
        let json = await res.json();
        renderAuthorities(json.data);
        renderbtns(json.totalpages,filter);
    }
    
}

if(filters) {
    for(let filter of filters) {
    filter.addEventListener("click",() => {
        let a = filter.getAttribute("id");
        loadpage(1,a);
    });
}
}

document.addEventListener("DOMContentLoaded", function () {
    loadpage(1);
    }); 