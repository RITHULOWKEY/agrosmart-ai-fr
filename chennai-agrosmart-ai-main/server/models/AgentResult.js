const mongoose = require('mongoose');

const agentResultSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropAnalysis',
      required: true,
      index: true,
    },
    agentType: {
      type: String,
      required: true,
      enum: ['crop', 'weather', 'soil', 'market'],
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'PARTIAL', 'TEMPORARILY_UNAVAILABLE', 'FAILED'],
      default: 'SUCCESS',
    },
    mode: {
      type: String,
      enum: ['REAL', 'DEMO', 'UNAVAILABLE'],
      default: 'DEMO',
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

agentResultSchema.index({ analysisId: 1, agentType: 1 });

module.exports = mongoose.model('AgentResult', agentResultSchema);
