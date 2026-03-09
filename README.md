# Smart Grievance Management System

A full-stack grievance tracking platform that allows users to submit complaints, authorities to review and resolve them, and administrators to monitor the workflow.

The system includes **role-based access control, SLA monitoring, escalation tracking, and automated email notifications.**

This project demonstrates a workflow-based complaint management system similar to helpdesk or ticketing platforms used in real organizations.

---

## Features

- User grievance submission with optional attachments
- Role-based authentication (User, Authority, Admin)
- JWT-based authentication and protected routes
- Authority assignment and reassignment by admin
- Grievance status workflow  
  *(Submitted → Under Review → In Progress → Resolved)*
- SLA monitoring with breach detection
- Escalation handling for overdue grievances
- Authority notes during status updates
- Grievance history timeline
- Email notifications for grievance updates
- Admin dashboard with system statistics
- User account restriction *(block/unblock)*
- Centralized error handling middleware

---

## System Roles

### User
- Submit grievances
- Track grievance status
- View authority updates
- Download grievance reports

### Authority
- Review assigned grievances
- Update grievance status
- Add internal notes
- Resolve grievances

### Admin
- Assign grievances to authorities
- Monitor SLA breaches
- Reassign overdue grievances
- Manage users and authorities
- View system dashboard and statistics

---

## Tech Stack

### Frontend
- EJS
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Additional Tools
- JWT Authentication
- Nodemailer *(Email notifications)*
- Multer *(File uploads)*
- Cloudinary
