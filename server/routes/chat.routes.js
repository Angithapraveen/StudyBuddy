const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware.js');
const { Upload } = require('../models/analysis.model.js');
const Chat = require('../models/chat.model.js');
const aiService = require('../services/ai.service.js');

router.post('/:uploadId', authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    const { uploadId } = req.params;
    if (!message) throw new Error('Message is required');
    const upload = await Upload.findOne({ _id: uploadId, userId: req.userId });
    if (!upload) throw new Error('Material not found or access denied');
    let chat = await Chat.findOne({ uploadId, userId: req.userId });
    if (!chat) {
      chat = new Chat({ uploadId, userId: req.userId, messages: [] });
    }
    const history = chat.messages.map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await aiService.chatWithContext(upload.extractedText, message, history);
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'model', content: aiResponse });
    await chat.save();
    res.json({ success: true, role: 'model', text: aiResponse });
  } catch (error) {
    next(error);
  }
});

router.get('/:uploadId', authMiddleware, async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ uploadId: req.params.uploadId, userId: req.userId });
    if (!chat) return res.json({ success: true, messages: [] });
    res.json({ success: true, messages: chat.messages });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
