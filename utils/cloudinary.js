require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  throw new Error("Cloudinary configuration missing in environment variables");
}

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
});




const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Grievance-attachments',
    allowed_formats: ['png', 'jpg', 'jpeg','pdf'],
  },
});

module.exports = storage;