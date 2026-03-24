const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware.js');
const { Upload, Analysis } = require('../models/analysis.model.js');

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const materials = await Upload.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: materials.length, materials });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const upload = await Upload.findOne({ _id: req.params.id, userId: req.userId });
    if (!upload) throw new Error('Material not found');
    const analysis = await Analysis.findOne({ uploadId: upload._id });
    res.json({ success: true, material: upload, analysis });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const upload = await Upload.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!upload) throw new Error('Material not found or access denied');
    await Analysis.deleteOne({ uploadId: upload._id });
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
