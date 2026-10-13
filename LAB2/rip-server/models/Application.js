import mongoose from 'mongoose';

// Схема заявки на організацію ритуальних послуг
const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'done'],
      default: 'new'
    }
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
