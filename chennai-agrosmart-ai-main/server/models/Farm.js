const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Chennai Rural, Tamil Nadu',
      trim: true,
    },
    soilType: {
      type: String,
      enum: ['Sandy', 'Clay', 'Loamy', 'Red Soil', 'Unknown'],
      default: 'Red Soil',
    },
    farmSize: {
      type: Number,
      default: 2.5, // acres
    },
    primaryCrop: {
      type: String,
      default: 'Tomato',
      trim: true,
    },
    irrigationType: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Manual'],
      default: 'Drip',
    },
    gisData: {
      type: {
        type: String,
        default: 'Polygon',
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      areaSqMeters: { type: Number, default: 0 },
      areaAcres: { type: Number, default: 0 },
      areaHectares: { type: Number, default: 0 },
      perimeterMeters: { type: Number, default: 0 },
      vertexCount: { type: Number, default: 0 },
      center: {
        lat: { type: Number },
        lng: { type: Number },
      },
      notes: { type: String, default: '' },
      updatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }

);

farmSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Farm', farmSchema);
