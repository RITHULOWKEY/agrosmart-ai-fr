const cropAgent = require('./cropAgent');
const weatherAgent = require('./weatherAgent');
const soilAgent = require('./soilAgent');
const marketAgent = require('./marketAgent');
const decisionEngine = require('./decisionEngine');
const AgentResult = require('../models/AgentResult');
const FinalRecommendation = require('../models/FinalRecommendation');
const CropAnalysis = require('../models/CropAnalysis');

/**
 * Multi-Agent Orchestrator
 * Dispatches tasks concurrently to the 4 specialized intelligence agents:
 * 1. Crop Intelligence Agent
 * 2. Weather Intelligence Agent
 * 3. Soil Intelligence Agent
 * 4. Market Intelligence Agent
 *
 * Uses Promise.allSettled() so an individual agent outage never halts the pipeline.
 * Then forwards agent insights to the AgroSmart Decision Engine.
 */
class AgentOrchestrator {
  async orchestrateAnalysis({
    analysisId,
    imagePath,
    cropType,
    soilType,
    location,
    plantingDate,
    growthStage,
    soilParameters,
    optionalInfo,
    lat,
    lon,
  }) {
    console.log(`[Agent Orchestrator] Starting 4-Agent Pipeline for Analysis ID: ${analysisId}...`);

    // Run all 4 agents concurrently with resilient isolation
    const [cropOutcome, weatherOutcome, soilOutcome, marketOutcome] = await Promise.allSettled([
      cropAgent.run({ imagePath, cropType, plantingDate, optionalInfo }),
      weatherAgent.run({ location, lat, lon, cropType, growthStage, soilType }),
      soilAgent.run({ crop: cropType, soilType, soilParameters, plantingDate, growthStage }),
      marketAgent.run({ crop: cropType, location }),
    ]);

    // Parse agent results with fallbacks for rejected promises
    const extractAgentResult = (outcome, agentType) => {
      if (outcome.status === 'fulfilled' && outcome.value) {
        return outcome.value;
      }
      console.warn(`[Agent Orchestrator] ${agentType} agent rejected:`, outcome.reason);
      return {
        agentType,
        status: 'TEMPORARILY_UNAVAILABLE',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          note: `${agentType} intelligence service was temporarily unreachable.`,
        },
      };
    };

    const cropData = extractAgentResult(cropOutcome, 'crop');
    const weatherData = extractAgentResult(weatherOutcome, 'weather');
    const soilData = extractAgentResult(soilOutcome, 'soil');
    const marketData = extractAgentResult(marketOutcome, 'market');

    // Persist Agent Results into MongoDB
    const agentRecords = [cropData, weatherData, soilData, marketData];
    const savedAgentResults = {};

    for (const record of agentRecords) {
      const saved = await AgentResult.findOneAndUpdate(
        { analysisId, agentType: record.agentType },
        {
          analysisId,
          agentType: record.agentType,
          status: record.status,
          mode: record.mode,
          confidence: record.confidence,
          result: record.result,
        },
        { upsert: true, new: true }
      );
      savedAgentResults[record.agentType] = saved;
    }

    // Pass outputs to the AgroSmart Decision Engine
    const recommendationOutput = decisionEngine.synthesize({
      cropResult: cropData.result,
      weatherResult: weatherData.result,
      soilResult: soilData.result,
      marketResult: marketData.result,
    });

    // Save Final Recommendation into MongoDB
    const savedRecommendation = await FinalRecommendation.findOneAndUpdate(
      { analysisId },
      {
        analysisId,
        overallStatus: recommendationOutput.overallStatus,
        priority: recommendationOutput.priority,
        summary: recommendationOutput.summary,
        actions: recommendationOutput.actions,
        rationaleChain: recommendationOutput.rationaleChain,
        riskScore: recommendationOutput.riskScore,
        sustainabilityScore: recommendationOutput.sustainabilityScore,
      },
      { upsert: true, new: true }
    );

    // Update CropAnalysis document with overall status & agent modes
    await CropAnalysis.findByIdAndUpdate(analysisId, {
      overallStatus: recommendationOutput.overallStatus,
      analysisMode: {
        cropAgent: cropData.mode,
        weatherAgent: weatherData.mode,
        soilAgent: soilData.mode,
        marketAgent: marketData.mode,
      },
    });

    console.log(`[Agent Orchestrator] Analysis ${analysisId} pipeline successfully completed!`);

    return {
      analysisId,
      agents: savedAgentResults,
      recommendation: savedRecommendation,
    };
  }
}

module.exports = new AgentOrchestrator();
