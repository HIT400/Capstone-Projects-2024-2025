/**
 * Re-export authentication middleware from authController for backward compatibility
 */
import { protect, restrictTo } from '../controllers/authController.js';

export { protect, restrictTo };
