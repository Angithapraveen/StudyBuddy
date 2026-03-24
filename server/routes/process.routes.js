const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth.middleware.js');
const YouTubeService = require('../services/youtube.service.js');
const DocumentService = require('../services/document.service.js');
const aiService = require('../services/ai.service.js');
const { Upload, Analysis } = require('../models/analysis.model.js');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and DOCX files are allowed'));
  },
});

router.post('/youtube-summary', authMiddleware, async (req, res, next) => {
  try {
    const { url, transcript: clientTranscript } = req.body;
    if (!url) throw new Error('YouTube link is required');

    const videoId = YouTubeService.getVideoId(url);
    if (!videoId) {
      const err = new Error('Invalid YouTube URL');
      err.statusCode = 400;
      throw err;
    }

    let transcript;
    if (typeof clientTranscript === 'string' && clientTranscript.trim().length > 0) {
      transcript = clientTranscript.trim();
      console.log('[POST /api/process/youtube-summary] using client transcript, length:', transcript.length);
    } else {
      console.log('[POST /api/process/youtube-summary] fetching transcript server-side');
      transcript = await YouTubeService.getTranscript(url);
    }

    if (!transcript) {
        throw new Error('Transcript not available');
    }

    const result = await aiService.analyzeMaterial(transcript, { source: 'youtube' });
    const newUpload = new Upload({
      userId: req.userId,
      title: `YouTube: ${videoId}`,
      type: 'youtube',
      sourceUrl: url,
      extractedText: transcript
    });
    await newUpload.save();
    const newAnalysis = new Analysis({
      uploadId: newUpload._id,
      ...result
    });
    await newAnalysis.save();
    res.json({ success: true, uploadId: newUpload._id, analysis: result });
  } catch (error) {
    next(error);
  }
});

router.post('/doc-summary', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new Error('File upload is required');
    const extractedText = await DocumentService.extractText(req.file);
    const result = await aiService.analyzeMaterial(extractedText, { source: 'document' });
    const newUpload = new Upload({
      userId: req.userId,
      title: req.file.originalname,
      type: req.file.mimetype.includes('pdf') ? 'pdf' : 'docx',
      filePath: req.file.path,
      extractedText: extractedText
    });
    await newUpload.save();
    const newAnalysis = new Analysis({
      uploadId: newUpload._id,
      ...result
    });
    await newAnalysis.save();
    res.json({ success: true, uploadId: newUpload._id, analysis: result });
  } catch (error) {
    // Return friendly error
    if (error.message.includes('large') || error.message.includes('limit')) {
       next(new Error('File too large'));
       return;
    }
    next(error);
  }
});

module.exports = router;
