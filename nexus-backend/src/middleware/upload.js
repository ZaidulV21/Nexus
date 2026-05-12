// nexus-backend/src/middleware/upload.js
const cloudinary            = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer                = require('multer')
require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'nexus-documents',
    allowed_formats: ['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx'],
    resource_type:   'auto',
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg','image/jpg','image/png','image/gif','application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed.'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }
})

module.exports = { upload, cloudinary }
