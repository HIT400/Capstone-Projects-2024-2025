import express from 'express';
import { testAnthropicInferenceAPI } from '../services/aiService.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/ai/test
 * @desc    Test Anthropic Inference API connection
 * @access  Private (Admin only)
 */
router.get('/test', protect, async (req, res, next) => {
  try {
    // Only allow admins to test the AI service
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to test AI service'
      });
    }

    const response = await testAnthropicInferenceAPI();

    res.json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
