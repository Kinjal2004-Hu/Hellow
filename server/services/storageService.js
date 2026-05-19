const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

exports.generateUploadUrl = async (fileName, mimeType) => {
  const ext = path.extname(fileName);
  const key = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, key);
  return {
    key,
    filePath,
    uploadUrl: `/uploads/${key}`,
    publicUrl: `/uploads/${key}`,
  };
};

exports.deleteFile = async (fileKey) => {
  const filePath = path.join(UPLOADS_DIR, path.basename(fileKey));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return { success: true };
  }
  return { success: false, error: 'File not found' };
};
