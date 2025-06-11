import express from 'express';
import {
  uploadDocument,
  getDocument,
  checkCompliance,
  downloadDocument,
  getUserDocuments,
  getAllDocuments,
  deleteDocument,
  addReview,
  getDocumentReviews,
  updateDocumentStatus,
  retryDocumentProcessing
} from '../controllers/documentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import upload, { handleUploadErrors } from '../config/multerConfig.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Document CRUD routes
router.post('/', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'paymentReceipt', maxCount: 1 }
]), handleUploadErrors, uploadDocument);
router.get('/', getUserDocuments);
router.get('/all', roleMiddleware.isAdmin, getAllDocuments); // Admin-only route to get all documents
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

// Compliance routes
router.get('/:id/compliance', checkCompliance);

// Document processing routes
router.post('/:id/retry', retryDocumentProcessing);

// Review routes
router.post('/:id/reviews', addReview);
router.get('/:id/reviews', getDocumentReviews);

// Status management
router.put('/:id/status', updateDocumentStatus);

export default router;