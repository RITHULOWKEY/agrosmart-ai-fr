const axios = require('axios');

/**
 * Agent 4 — 📈 MARKET INTELLIGENCE AGENT
 * Purpose: Analyze market conditions for the farmer's selected crop.
 * Reference Market: Koyambedu Wholesale Vegetable Market & Chennai Mandis
 */
class MarketIntelligenceAgent {
  async run({ crop, location = 'Chennai', customPrice }) {
    console.log(`[Market Intelligence Agent] Checking mandi prices for ${crop} around ${location}...`);

    try {
      // 1. Check if external Government Agmarknet or Mandi API is configured
      const marketApiUrl = process.env.MARKET_API_URL;
      const marketApiKey = process.env.MARKET_API_KEY;

      if (marketApiUrl && marketApiKey) {
        try {
          const apiRes = await axios.get(marketApiUrl, {
            params: { crop, market: 'Koyambedu', api_key: marketApiKey },
            timeout: 5000,
          });
          if (apiRes.data && apiRes.data.price) {
            return {
              agentType: 'market',
              status: 'SUCCESS',
              mode: 'REAL',
              confidence: 96,
              result: {
                crop: crop || 'Tomato',
                currentPrice: apiRes.data.price,
                currency: 'INR/kg',
                trend: apiRes.data.trend || 'Stable',
                demand: apiRes.data.demand || 'Moderate',
                marketCondition: apiRes.data.condition || 'Favorable',
                marketRecommendation: apiRes.data.recommendation || 'Selling prices are within viable profit margins.',
                marketName: apiRes.data.marketName || 'Koyambedu Wholesale Market, Chennai',
              },
            };
          }
        } catch (e) {
          console.warn('Real Mandi API failed, falling back to calibrated DEMO MARKET MODE.');
        }
      }

      // 2. Calibrated Regional Mandi Simulation (DEMO MARKET MODE)
      // Prices calibrated with actual Chennai Mandi trading averages
      const cropKey = (crop || 'Tomato').toLowerCase();

      const mandiBenchmarks = {
        tomato: {
          currentPrice: 34,
          trend: 'Increasing',
          trendPercentage: '+12.5%',
          demand: 'High',
          marketCondition: 'Favorable',
          marketRecommendation: 'Current wholesale prices at Koyambedu are surging due to localized supply tapering. Ideal selling window.',
          priceHistory: [
            { day: 'Day 1', price: 26 },
            { day: 'Day 2', price: 28 },
            { day: 'Day 3', price: 30 },
            { day: 'Day 4', price: 31 },
            { day: 'Day 5', price: 34 },
          ],
        },
        paddy: {
          currentPrice: 24,
          trend: 'Stable',
          trendPercentage: '+1.8%',
          demand: 'Moderate',
          marketCondition: 'Neutral',
          marketRecommendation: 'Direct Procurement Centers (DPC) are operating at MSP (Minimum Support Price) guarantee.',
          priceHistory: [
            { day: 'Day 1', price: 23 },
            { day: 'Day 2', price: 23.5 },
            { day: 'Day 3', price: 24 },
            { day: 'Day 4', price: 24 },
            { day: 'Day 5', price: 24 },
          ],
        },
        chilli: {
          currentPrice: 110,
          trend: 'Increasing',
          trendPercentage: '+18.0%',
          demand: 'High',
          marketCondition: 'Favorable',
          marketRecommendation: 'Spice processing units are actively buying green chillies at premium spot rates.',
          priceHistory: [
            { day: 'Day 1', price: 88 },
            { day: 'Day 2', price: 92 },
            { day: 'Day 3', price: 99 },
            { day: 'Day 4', price: 104 },
            { day: 'Day 5', price: 110 },
          ],
        },
        brinjal: {
          currentPrice: 28,
          trend: 'Decreasing',
          trendPercentage: '-6.2%',
          demand: 'Moderate',
          marketCondition: 'Neutral',
          marketRecommendation: 'Higher inbound shipments from Vellore arriving. Consider graded packaging to preserve margins.',
          priceHistory: [
            { day: 'Day 1', price: 32 },
            { day: 'Day 2', price: 31 },
            { day: 'Day 3', price: 30 },
            { day: 'Day 4', price: 29 },
            { day: 'Day 5', price: 28 },
          ],
        },
        sugarcane: {
          currentPrice: 310, // per quintal
          currency: 'INR/quintal',
          trend: 'Stable',
          trendPercentage: '0.0%',
          demand: 'High',
          marketCondition: 'Favorable',
          marketRecommendation: 'Sugar mills offering scheduled crushing quotas. Coordinate cutting date with mill dispatch.',
          priceHistory: [
            { day: 'Day 1', price: 310 },
            { day: 'Day 2', price: 310 },
            { day: 'Day 3', price: 310 },
            { day: 'Day 4', price: 310 },
            { day: 'Day 5', price: 310 },
          ],
        },
      };

      const selected = mandiBenchmarks[cropKey] || {
        currentPrice: 30,
        currency: 'INR/kg',
        trend: 'Stable',
        trendPercentage: '+2.0%',
        demand: 'Moderate',
        marketCondition: 'Favorable',
        marketRecommendation: 'Spot mandi prices are stable. Coordinate harvest timing with peak morning trading hours.',
        priceHistory: [
          { day: 'Day 1', price: 28 },
          { day: 'Day 2', price: 29 },
          { day: 'Day 3', price: 29 },
          { day: 'Day 4', price: 30 },
          { day: 'Day 5', price: 30 },
        ],
      };

      return {
        agentType: 'market',
        status: 'SUCCESS',
        mode: 'DEMO', // Clearly labeled as DEMO MARKET MODE
        confidence: 85,
        result: {
          crop: crop || 'Tomato',
          currentPrice: customPrice || selected.currentPrice,
          currency: selected.currency || 'INR/kg',
          trend: selected.trend,
          trendPercentage: selected.trendPercentage,
          demand: selected.demand,
          marketCondition: selected.marketCondition,
          marketRecommendation: selected.marketRecommendation,
          marketName: 'Koyambedu Wholesale Market, Chennai (Demo Benchmark)',
          priceHistory: selected.priceHistory,
        },
      };
    } catch (error) {
      console.error('[Market Intelligence Agent] Error:', error.message);
      return {
        agentType: 'market',
        status: 'TEMPORARILY_UNAVAILABLE',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          crop: crop || 'Unknown',
          currentPrice: 0,
          currency: 'INR/kg',
          trend: 'Unavailable',
          demand: 'Unknown',
          marketCondition: 'Unknown',
          marketRecommendation: 'Market pricing feed is temporarily unavailable. Check local mandi board for daily rates.',
        },
      };
    }
  }
}

module.exports = new MarketIntelligenceAgent();
