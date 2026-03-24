const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentService {
  static async extractFromPdf(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text.trim();
    } catch (error) {
      console.error('PDF Parsing Error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  static async extractFromDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } catch (error) {
      console.error('DOCX Parsing Error:', error);
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  static async extractText(file) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') {
      return await this.extractFromPdf(file.path);
    } else if (ext === 'docx') {
      return await this.extractFromDocx(file.path);
    } else {
      throw new Error('Unsupported file extension');
    }
  }
}

module.exports = DocumentService;
