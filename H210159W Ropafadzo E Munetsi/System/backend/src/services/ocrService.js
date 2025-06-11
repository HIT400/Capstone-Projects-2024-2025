import { createWorker } from 'tesseract.js';
import pdf from '../utils/pdf-parse-fixed.js';

/**
 * Extracts text from a document buffer
 * @param {Buffer} buffer - The document buffer
 * @param {string} mimeType - The MIME type of the document
 * @returns {Promise<{text: string, confidence: number, error: string|null}>}
 */
export async function extractTextFromBuffer(buffer, mimeType) {
  let worker;
  try {
    // Handle PDF documents
    if (mimeType === 'application/pdf') {
      try {
        const result = await pdf(buffer);
        return {
          text: result.text || '',
          confidence: calculateTextConfidence(result.text),
          error: null
        };
      } catch (error) {
        console.error('PDF extraction error:', error);
        return {
          text: '',
          confidence: 0,
          error: `PDF extraction failed: ${error.message}`
        };
      }
    }
    // Handle image documents
    else if (mimeType.startsWith('image/')) {
      try {
        worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data } = await worker.recognize(buffer);

        return {
          text: data.text || '',
          confidence: data.confidence / 100, // Tesseract returns confidence as percentage
          error: null
        };
      } catch (error) {
        console.error('OCR extraction error:', error);
        return {
          text: '',
          confidence: 0,
          error: `OCR extraction failed: ${error.message}`
        };
      }
    }
    // Unsupported file type
    return {
      text: '',
      confidence: 0,
      error: `Unsupported file type: ${mimeType}`
    };
  } finally {
    // Ensure worker is terminated
    if (worker) {
      try {
        await worker.terminate();
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
    }
  }
}

/**
 * Calculates confidence score for extracted text
 * @param {string} text - The extracted text
 * @returns {number} Confidence score between 0 and 1
 */
function calculateTextConfidence(text) {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Check for common OCR/extraction issues
  const hasGarbledText = /[^\w\s.,;:'"-()\[\]{}?!@#$%^&*+=<>|\\/]{10,}/.test(text);
  const hasMissingSpaces = /[a-zA-Z]{20,}/.test(text);
  const hasReasonableLength = text.length > 100;

  // Calculate base confidence
  let confidence = 0.5; // Start with neutral confidence

  // Adjust based on text quality indicators
  if (hasGarbledText) confidence -= 0.2;
  if (hasMissingSpaces) confidence -= 0.2;
  if (hasReasonableLength) confidence += 0.3;

  // Check for architectural terms
  const architecturalTerms = [
    'floor', 'wall', 'ceiling', 'roof', 'foundation',
    'dimension', 'height', 'width', 'length', 'area'
  ];

  const termCount = architecturalTerms.reduce((count, term) => {
    return count + (text.toLowerCase().includes(term) ? 1 : 0);
  }, 0);

  // Adjust confidence based on relevant terms
  confidence += Math.min(0.3, termCount * 0.03);

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}