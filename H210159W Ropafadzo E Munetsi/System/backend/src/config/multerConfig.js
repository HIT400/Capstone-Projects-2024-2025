import multer from 'multer';
import path from 'path';
import { ErrorResponse } from '../utils/errorResponse.js';

// Use memory storage to get buffer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|jpeg|jpg|png|doc|docx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Only documents (PDF, Word, Text, Images) are allowed', 400));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Middleware to handle upload errors
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ErrorResponse('File size too large. Maximum 10MB allowed', 400));
    }
    return next(new ErrorResponse('File upload error', 400));
  } else if (err) {
    return next(err);
  }
  next();
};

export default upload;