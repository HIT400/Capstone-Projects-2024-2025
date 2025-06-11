import { ErrorResponse } from '../utils/errorResponse.js';
import DocumentModel from '../models/documentModel.js';
import { extractTextFromBuffer } from '../services/ocrService.js';
import pool from '../config/db.js';

/**
 * Upload a document and extract text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const uploadDocument = async (req, res, next) => {
  try {
    console.log('Document upload request received');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ?
      Object.keys(req.files).map(key => ({
        fieldname: key,
        count: req.files[key].length,
        files: req.files[key].map(f => ({
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          buffer: f.buffer ? 'Buffer present' : 'No buffer'
        }))
      })) : 'No files');

    // Validate main document file upload
    if (!req.files || !req.files.file || !req.files.file[0]) {
      console.log('No main document file uploaded');
      return next(new ErrorResponse('No main document file uploaded', 400));
    }

    // Get the main document file
    const mainFile = req.files.file[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(mainFile.mimetype)) {
      console.log(`Invalid file type: ${mainFile.mimetype}`);
      return next(new ErrorResponse(
        `Invalid file type: ${mainFile.mimetype}. Allowed types: PDF, JPEG, PNG, TIFF`,
        400
      ));
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (mainFile.size > maxSize) {
      console.log(`File too large: ${(mainFile.size / (1024 * 1024)).toFixed(2)}MB`);
      return next(new ErrorResponse(
        `File too large: ${(mainFile.size / (1024 * 1024)).toFixed(2)}MB. Maximum size: 10MB`,
        400
      ));
    }

    // Ensure file buffer is present
    if (!mainFile.buffer) {
      console.log('File buffer is missing');
      return next(new ErrorResponse('File buffer is missing', 400));
    }

    console.log('Creating document record');
    // Create document record
    const document = await DocumentModel.create({
      userId: req.user.id,
      file: mainFile,
      applicationId: req.body.applicationId || null,
      categoryId: req.body.categoryId || null
    });

    console.log('Document created successfully:', document.id);

    // Process payment details if provided
    if (req.body.paymentAmount) {
      try {
        console.log('Payment details detected, creating payment record');

        // Extract payment details from request
        const {
          paymentAmount,
          paymentMethod,
          referenceNumber,
          paymentNotes
        } = req.body;

        // Get payment receipt file if it exists
        let paymentReceiptFile = null;
        if (req.files && req.files.paymentReceipt && req.files.paymentReceipt.length > 0) {
          paymentReceiptFile = req.files.paymentReceipt[0];

          // Validate payment receipt file
          if (paymentReceiptFile.size > 10 * 1024 * 1024) { // 10MB limit
            console.log(`Payment receipt file too large: ${(paymentReceiptFile.size / (1024 * 1024)).toFixed(2)}MB`);
            throw new Error(`Payment receipt file too large. Maximum size: 10MB`);
          }
        }

        // Import the payment model
        const { createPaymentService } = await import('../models/paymentModel.js');

        // Create payment record
        const payment = await createPaymentService({
          applicationId: req.body.applicationId,
          userId: req.user.id,
          amount: paymentAmount,
          paymentMethod: paymentMethod || 'bank_transfer',
          referenceNumber: referenceNumber || null,
          invoiceFileName: paymentReceiptFile ? paymentReceiptFile.originalname : null,
          invoiceFileType: paymentReceiptFile ? paymentReceiptFile.mimetype : null,
          invoiceFileSize: paymentReceiptFile ? paymentReceiptFile.size : null,
          invoiceFileData: paymentReceiptFile ? paymentReceiptFile.buffer : null,
          notes: paymentNotes || null
        });

        console.log('Payment record created successfully:', payment.id);

        // Return both document and payment information
        res.status(201).json({
          success: true,
          data: {
            document,
            payment: {
              id: payment.id,
              amount: payment.amount,
              paymentMethod: payment.payment_method,
              status: payment.payment_status
            }
          },
          message: 'Document uploaded and payment recorded successfully. Text extraction in progress.'
        });
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);

        // Still return success for the document upload, but include payment error
        res.status(201).json({
          success: true,
          data: document,
          paymentError: paymentError.message,
          message: 'Document uploaded successfully, but payment recording failed. Text extraction in progress.'
        });
      }
    } else {
      // No payment details provided, just return document info
      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully. Text extraction in progress.'
      });
    }
  } catch (error) {
    console.error('Document upload error:', error);
    console.error('Error stack:', error.stack);
    next(new ErrorResponse(
      `Document upload failed: ${error.message}`,
      500
    ));
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this document', 403));
    }

    res.json({
      success: true,
      data: {
        id: document.id,
        fileName: document.file_name,
        fileType: document.file_type,
        fileSize: document.file_size,
        createdAt: document.created_at,
        status: document.status,
        applicationId: document.application_id,
        categoryId: document.category_id,
        extractedText: document.extracted_text,
        complianceResult: document.compliance_result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check document compliance with building standards
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const checkCompliance = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate document ID
    if (!id || id === 'undefined' || id === 'null') {
      return next(new ErrorResponse('Invalid document ID provided', 400));
    }

    // Try to parse the ID as an integer
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      return next(new ErrorResponse(`Invalid document ID format: ${id}`, 400));
    }

    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this document', 403));
    }

    // Check if document has text content
    if (!document.extracted_text || document.extracted_text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient text content',
        message: 'The document does not contain enough text for compliance checking.',
        suggestions: [
          'Upload a clearer document',
          'Ensure the document is not password protected',
          'Try a different file format (PDF is recommended)'
        ]
      });
    }

    // Perform compliance check
    try {
      const result = await DocumentModel.checkCompliance(documentId);

      // Check if there was an error during compliance check
      if (result.error) {
        // Still return the partial results with a 422 status
        return res.status(422).json({
          success: false,
          error: result.error,
          message: 'Compliance check completed with warnings: ' + result.error,
          data: result,
          suggestions: [
            'The document was processed but some checks could not be completed',
            'You can still view the partial results',
            'Try uploading a clearer document if needed'
          ]
        });
      }

      // If document is compliant, update the application status and stage
      let applicationUpdated = false;
      if (result.compliant && document.application_id) {
        try {
          // Get the current application status
          const applicationQuery = await pool.query(
            'SELECT status, current_stage_id FROM applications WHERE id = $1',
            [document.application_id]
          );

          const application = applicationQuery.rows[0];

          if (application) {
            // If application is in draft/pending status, update it to approved
            if (application.status === 'draft' || application.status === 'pending') {
              await pool.query(
                'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
                ['approved', document.application_id]
              );
              applicationUpdated = true;

              // If the application has a current stage related to document verification,
              // mark requirements as completed and potentially move to next stage
              if (application.current_stage_id) {
                // Get the stage information
                const stageQuery = await pool.query(
                  'SELECT id, name FROM application_stages WHERE id = $1',
                  [application.current_stage_id]
                );

                const stage = stageQuery.rows[0];

                // If this is the document verification stage
                if (stage && stage.name.toLowerCase().includes('document') &&
                    stage.name.toLowerCase().includes('verification')) {

                  // Get requirements for this stage
                  const requirementsQuery = await pool.query(
                    `SELECT sr.id
                     FROM stage_requirements sr
                     WHERE sr.stage_id = $1 AND sr.name LIKE '%compliance%'
                     OR sr.name LIKE '%document%'`,
                    [application.current_stage_id]
                  );

                  // Mark compliance requirements as completed
                  for (const req of requirementsQuery.rows) {
                    await pool.query(
                      `INSERT INTO requirement_completion
                       (application_id, requirement_id, status, completed_at, notes, updated_at)
                       VALUES ($1, $2, 'completed', NOW(), 'Automatically marked as completed after successful compliance check', NOW())
                       ON CONFLICT (application_id, requirement_id)
                       DO UPDATE SET status = 'completed', completed_at = NOW(),
                                    notes = 'Automatically marked as completed after successful compliance check',
                                    updated_at = NOW()`,
                      [document.application_id, req.id]
                    );
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating application status after compliance check:', error);
          // Continue with the response even if updating application status fails
        }
      }

      res.json({
        success: true,
        message: result.compliant ?
          'Document complies with building standards' :
          'Document has compliance issues that need to be addressed',
        data: result,
        application_updated: applicationUpdated
      });
    } catch (error) {
      console.error('Compliance check error:', error);

      // Return a more user-friendly error with suggestions
      return res.status(500).json({
        success: false,
        error: error.message,
        message: `Compliance check failed: ${error.message}`,
        suggestions: [
          'Try uploading a clearer document',
          'Ensure the document is not password protected',
          'Try a different file format (PDF is recommended)',
          'Contact support if the issue persists'
        ]
      });
    }
  } catch (error) {
    console.error('Document retrieval error:', error);
    next(new ErrorResponse(
      `Failed to process document: ${error.message}`,
      500
    ));
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fileData = await DocumentModel.getFileBuffer(id);

    if (!fileData) {
      return next(new ErrorResponse('Document not found', 404));
    }

    const document = await DocumentModel.findById(id);
    if (document.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this document', 403));
    }

    res.setHeader('Content-Type', fileData.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.file_name}"`);
    res.send(fileData.file_data);
  } catch (error) {
    next(error);
  }
};

export const getUserDocuments = async (req, res, next) => {
  try {
    const documents = await DocumentModel.findByUserId(req.user.id);
    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllDocuments = async (req, res, next) => {
  try {
    console.log('getAllDocuments called with user:', {
      id: req.user.id,
      role: req.user.role,
      roles: req.user.roles || 'undefined'
    });

    // Check if user is admin - handle both role and roles properties
    // In our system, we use role (singular) property, not roles (plural)
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    console.log(`User role: ${req.user.role}, isAdmin: ${isAdmin}`);

    if (!isAdmin) {
      console.log('User is not an admin, access denied');
      return next(new ErrorResponse('Not authorized to access all documents', 403));
    }

    console.log('User is admin, proceeding to fetch all documents');
    const documents = await DocumentModel.findAll();

    console.log(`Found ${documents.length} documents`);

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching all documents:', error);
    next(new ErrorResponse(
      `Failed to fetch all documents: ${error.message}`,
      500
    ));
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }
    if (document.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this document', 403));
    }

    await DocumentModel.delete(id);
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments, status } = req.body;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    // Check if reviewer is different from document owner
    if (document.user_id === req.user.id) {
      return next(new ErrorResponse('Cannot review your own document', 400));
    }

    const review = await DocumentModel.addReview({
      documentId: id,
      reviewerId: req.user.id,
      comments,
      status
    });

    // Update document status if changed
    if (status !== 'needs_revision') {
      await DocumentModel.updateStatus(id, status);
    }

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return next(new ErrorResponse('Not authorized to view these reviews', 403));
    }

    const reviews = await DocumentModel.getReviews(id);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    // Only admin or document owner can update status
    if (document.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return next(new ErrorResponse('Not authorized to update this document', 403));
    }

    const updatedDoc = await DocumentModel.updateStatus(id, status, rejectionReason);
    res.json({
      success: true,
      data: updatedDoc
    });
  } catch (error) {
    console.error('Update document status error:', error);
    next(new ErrorResponse(
      `Failed to update document status: ${error.message}`,
      500
    ));
  }
};

/**
 * Retry document text extraction and compliance check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const retryDocumentProcessing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id, true); // Include file data

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return next(new ErrorResponse('Not authorized to process this document', 403));
    }

    // Check if document has file data
    if (!document.file_data) {
      return next(new ErrorResponse('Document file data not found', 404));
    }

    // Re-extract text from the document
    try {
      const extractionResult = await extractTextFromBuffer(document.file_data, document.file_type);

      // Update document with new extracted text
      const extractionMetadata = {
        confidence: extractionResult.confidence || 0,
        error: extractionResult.error,
        timestamp: new Date().toISOString(),
        retryCount: (document.extraction_metadata?.retryCount || 0) + 1
      };

      // Check if extraction_metadata column exists
      let hasExtractionMetadata = true;
      try {
        await pool.query('SELECT extraction_metadata FROM documents LIMIT 1');
      } catch (error) {
        if (error.message.includes('column "extraction_metadata" does not exist')) {
          console.warn('extraction_metadata column does not exist. Using fallback query.');
          hasExtractionMetadata = false;
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      if (hasExtractionMetadata) {
        // Use query with extraction_metadata
        await pool.query(
          `UPDATE documents
           SET extracted_text = $1,
               extraction_metadata = $2,
               updated_at = NOW()
           WHERE id = $3`,
          [extractionResult.text, JSON.stringify(extractionMetadata), id]
        );
      } else {
        // Fallback query without extraction_metadata
        await pool.query(
          `UPDATE documents
           SET extracted_text = $1,
               compliance_result = jsonb_set(COALESCE(compliance_result, '{}'::jsonb), '{extraction_metadata}', $2::jsonb),
               updated_at = NOW()
           WHERE id = $3`,
          [extractionResult.text, JSON.stringify(extractionMetadata), id]
        );
      }

      // If text extraction was successful, perform compliance check
      if (extractionResult.text && extractionResult.text.trim().length >= 50) {
        // Parse the ID to ensure it's a valid integer
        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) {
          throw new Error(`Invalid document ID format: ${id}`);
        }
        const complianceResult = await DocumentModel.checkCompliance(documentId);

        res.json({
          success: true,
          message: 'Document processing retry successful',
          data: {
            extractionResult: {
              success: !extractionResult.error,
              textLength: extractionResult.text.length,
              confidence: extractionResult.confidence
            },
            complianceResult
          }
        });
      } else {
        // Text extraction failed or insufficient text
        res.status(422).json({
          success: false,
          error: extractionResult.error || 'Insufficient text content',
          message: 'Document text extraction retry failed',
          data: {
            extractionResult: {
              success: false,
              textLength: extractionResult.text.length,
              confidence: extractionResult.confidence
            }
          },
          suggestions: [
            'Upload a clearer document',
            'Ensure the document is not password protected',
            'Try a different file format (PDF is recommended)'
          ]
        });
      }
    } catch (error) {
      console.error('Document processing retry error:', error);
      return next(new ErrorResponse(
        `Document processing retry failed: ${error.message}`,
        500
      ));
    }
  } catch (error) {
    console.error('Document retrieval error:', error);
    next(new ErrorResponse(
      `Failed to retrieve document: ${error.message}`,
      500
    ));
  }
};