const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  dueAt: { type: Date, default: null },
  done: { type: Boolean, default: false }
}, { timestamps: true });

taskSchema.index({ userId: 1, done: 1 });
taskSchema.index({ dueAt: 1 });

module.exports = mongoose.model('Task', taskSchema);
