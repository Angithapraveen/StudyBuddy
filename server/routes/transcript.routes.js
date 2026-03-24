const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware.js');
const YouTubeService = require('../services/youtube.service.js');

/**
 * POST /api/transcript
 * Body: { url: string }
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { url } = req.body;
    console.log('[POST /api/transcript] url:', url);

    const { videoId, transcript } = await YouTubeService.fetchTranscriptForApi(url);

    res.json({
      success: true,
      videoId,
      transcript,
    });
  } catch (err) {
    console.error('[POST /api/transcript] error:', err?.message || err);
    next(err);
  }
});

module.exports = router;
