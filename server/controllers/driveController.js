const DriveFile = require('../models/DriveFile');
const DriveFolder = require('../models/DriveFolder');

exports.getFiles = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.folderId) {
      filter.folderId = req.query.folderId === 'null' ? null : req.query.folderId;
    }

    filter.isTrashed = req.query.isTrashed === 'true';

    const files = await DriveFile.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = await DriveFile.create({
      userId: req.user._id,
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      folderId: req.body.folderId || null
    });

    res.status(201).json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await DriveFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isTrashed: true } },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

exports.updateFile = async (req, res, next) => {
  try {
    const file = await DriveFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

exports.getFolders = async (req, res, next) => {
  try {
    const folders = await DriveFolder.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, data: folders });
  } catch (err) {
    next(err);
  }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const folder = await DriveFolder.create({ userId: req.user._id, name, parentId: parentId || null });
    res.status(201).json({ success: true, data: folder });
  } catch (err) {
    next(err);
  }
};

exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await DriveFolder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, error: 'Folder not found' });
    }

    await DriveFile.updateMany(
      { folderId: folder._id, userId: req.user._id },
      { $set: { folderId: null } }
    );

    res.json({ success: true, data: { message: 'Folder deleted' } });
  } catch (err) {
    next(err);
  }
};
