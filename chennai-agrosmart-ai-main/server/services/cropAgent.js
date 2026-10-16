const { analyzePlantHealth } = require('./plantHealthService');

/**
 * Agent 1 — 🌱 CROP INTELLIGENCE AGENT
 * Purpose: Analyze the uploaded crop image and identify possible crop health conditions.
 */
class CropIntelligenceAgent {
  async run({ imagePath, cropType, plantingDate, optionalInfo }) {
    console.log(`[Crop Intelligence Agent] Analyzing ${cropType}...`);

    try {
      const analysis = await analyzePlantHealth({
        imagePath,
        cropType,
        plantingDate,
        optionalInfo,
      });

      return {
        agentType: 'crop',
        status: 'SUCCESS',
        mode: analysis.mode,
        confidence: analysis.confidence,
        result: {
          crop: analysis.crop,
          healthStatus: analysis.healthStatus,
          disease: analysis.disease,
          confidence: analysis.confidence,
          severity: analysis.severity,
          visualSymptoms: analysis.visualSymptoms,
          recommendation: analysis.recommendation,
          modelArchitecture: analysis.modelArch,
        },
      };
    } catch (error) {
      console.error('[Crop Intelligence Agent] Error:', error.message);
      return {
        agentType: 'crop',
        status: 'FAILED',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          crop: cropType || 'Unknown',
          healthStatus: 'Analysis Incomplete',
          disease: 'Unable to analyze image',
          confidence: 0,
          severity: 'Unknown',
          visualSymptoms: [],
          recommendation: 'Please re-upload a clear, well-lit leaf or plant photograph.',
        },
      };
    }
  }
}

module.exports = new CropIntelligenceAgent();
