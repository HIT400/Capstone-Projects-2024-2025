/**
 * Fixed version of pdf-parse that doesn't try to run in debug mode
 * This avoids the error with missing test files
 */
import Pdf from 'pdf-parse/lib/pdf-parse.js';

export default Pdf;
