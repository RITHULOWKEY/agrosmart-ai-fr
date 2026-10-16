const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    preferredLanguage: {
      type: String,
      default: 'English',
      enum: ['English', 'Tamil', 'Telugu', 'Hindi'],
    },
    location: {
      type: String,
      default: 'Chennai, Tamil Nadu',
      trim: true,
    },
    defaultCrop: {
      type: String,
      default: 'Tomato',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
