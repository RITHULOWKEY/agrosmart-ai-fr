const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
      index: true,
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    soilType: {
      type: String,
      enum: ['Sandy', 'Clay', 'Loamy', 'Red Soil', 'Unknown'],
      default: 'Red Soil',
    },
    plantingDate: {
      type: Date,
      default: Date.now,
    },
    growthStage: {
      type: String,
      enum: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity/Harvest'],
      default: 'Vegetative',
    },
    location: {
      type: String,
      default: 'Chennai, Tamil Nadu',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Crop image URL is required'],
    },
    imageOriginalName: {
      type: String,
      default: '',
    },
    soilParameters: {
      ph: { type: Number, default: 6.8 },
      nitrogen: { type: Number, default: 140 }, // kg/ha
      phosphorus: { type: Number, default: 35 },
      potassium: { type: Number, default: 190 },
      moisture: { type: Number, default: 65 }, // %
      organicMatter: { type: Number, default: 1.2 }, // %
    },
    analysisMode: {
      cropAgent: { type: String, enum: ['REAL', 'DEMO', 'UNAVAILABLE'], default: 'DEMO' },
      weatherAgent: { type: String, enum: ['REAL', 'DEMO', 'UNAVAILABLE'], default: 'DEMO' },
      soilAgent: { type: String, enum: ['REAL', 'DEMO', 'UNAVAILABLE'], default: 'DEMO' },
      marketAgent: { type: String, enum: ['REAL', 'DEMO', 'UNAVAILABLE'], default: 'DEMO' },
    },
    overallStatus: {
      type: String,
      default: 'Analyzing',
    },
  },
  {
    timestamps: true,
  }
);

cropAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);
