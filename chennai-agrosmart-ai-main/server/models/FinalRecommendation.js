const mongoose = require('mongoose');

const finalRecommendationSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropAnalysis',
      required: true,
      unique: true,
      index: true,
    },
    overallStatus: {
      type: String,
      required: true,
      enum: ['Optimal', 'Good Condition', 'Attention Recommended', 'Action Required', 'High Alert'],
      default: 'Good Condition',
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    summary: {
      type: String,
      required: true,
    },
    actions: [
      {
        type: String,
        required: true,
      },
    ],
    rationaleChain: [
      {
        factor: String,
        observation: String,
        implication: String,
      },
    ],
    riskScore: {
      type: Number,
      default: 25, // 0 - 100
    },
    sustainabilityScore: {
      type: Number,
      default: 85, // 0 - 100
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FinalRecommendation', finalRecommendationSchema);
