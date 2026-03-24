const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'pdf', 'docx'], required: true },
  sourceUrl: { type: String },
  filePath: { type: String },
  extractedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const AnalysisSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  summary: { type: String },
  notes: { type: [String] },
  keyPoints: { type: [String] },
  definitions: [{ 
    term: String, 
    definition: String 
  }],
  vivaQuestions: [{ 
    question: String, 
    answer: String 
  }],
  relatedTopics: { type: [String] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Upload: mongoose.model('Upload', UploadSchema),
  Analysis: mongoose.model('Analysis', AnalysisSchema)
};
