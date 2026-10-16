const { fetchExtendedWeather } = require('./weatherService');

/**
 * Agent 2 — 🌦️ WEATHER INTELLIGENCE AGENT
 * Purpose: Analyze real-time and 7-day forecast weather conditions
 * and synthesize actionable farming recommendations for the specific plot.
 */
class WeatherIntelligenceAgent {
  async run({ location, lat, lon, cropType, growthStage, soilType, farmSize, irrigationType }) {
    console.log(`[Weather Intelligence Agent] Checking conditions for ${location || 'Chennai'}...`);

    try {
      const weatherData = await fetchExtendedWeather({ location: location || 'Chennai', lat, lon });

      const current = weatherData.current;
      const forecast7Day = weatherData.forecast7Day || [];
      const temp = current.temperature;
      const humidity = current.humidity;
      const rain = current.rainfall;
      const windSpeed = current.windSpeed;

      // Agronomic risk meters
      let irrigationRisk = 'Low';
      let diseaseRisk = 'Low';

      // Determine irrigation risk
      if (rain > 10 || humidity > 80) {
        irrigationRisk = 'High';
      } else if (rain > 2 || humidity > 70) {
        irrigationRisk = 'Medium';
      } else if (temp > 35) {
        irrigationRisk = 'High (Evaporation)';
      }

      // Determine micro-climate disease risk
      if (humidity >= 75 && temp >= 24 && temp <= 34) {
        diseaseRisk = 'High (Fungal Spore Proliferation)';
      } else if (humidity >= 65 || rain > 3) {
        diseaseRisk = 'Medium';
      }

      // Lookahead over next 48-72 hours from 7-day forecast
      const next3Days = forecast7Day.slice(0, 3);
      const totalUpcomingRain = +(next3Days.reduce((acc, d) => acc + (d.precipitation || 0), 0)).toFixed(1);
      const maxUpcomingRainProb = Math.max(...next3Days.map((d) => d.rainProbability || 0), 0);
      const maxUpcomingTemp = Math.max(...forecast7Day.map((d) => d.tempMax || 0), temp);
      const minUpcomingTemp = Math.min(...forecast7Day.map((d) => d.tempMin || 99), temp);

      // Generate structured, context-rich farming recommendations
      const recommendations = [];

      // 1. Irrigation Management Recommendation
      if (totalUpcomingRain >= 5 || maxUpcomingRainProb >= 60 || rain > 2) {
        recommendations.push({
          id: 'rec-irrigation',
          category: 'Irrigation',
          priority: 'High',
          title: 'Consider Postponing Irrigation',
          action: 'Postpone scheduled irrigation for the next 24 to 48 hours.',
          reason: `Incoming forecast predicts ${totalUpcomingRain > 0 ? `${totalUpcomingRain}mm of rainfall` : 'significant precipitation'} (${maxUpcomingRainProb}% probability). Postponing irrigation conserves groundwater and prevents waterlogging.`,
          relevantWeather: `Upcoming rainfall: ${totalUpcomingRain}mm • Rain probability: ${maxUpcomingRainProb}% • Current humidity: ${humidity}%`,
          timing: 'Next 24-48 Hours',
          suitabilityStatus: 'Hold Operation',
        });
      } else if (temp > 35 || maxUpcomingTemp > 36) {
        recommendations.push({
          id: 'rec-irrigation',
          category: 'Irrigation',
          priority: 'High',
          title: 'Mitigate Heat Stress with Morning Irrigation',
          action: 'Schedule light drip or localized root-zone irrigation during early morning hours.',
          reason: `High daytime temperature (${temp}°C, peaking at ${maxUpcomingTemp}°C) induces rapid evapotranspiration, root-zone dehydration, and blossom drop in ${cropType || 'crops'}.`,
          relevantWeather: `Peak temp: ${maxUpcomingTemp}°C • Humidity: ${humidity}% • Wind: ${windSpeed} km/h`,
          timing: 'Early Morning (06:00 - 08:30)',
          suitabilityStatus: 'Action Required',
        });
      } else {
        recommendations.push({
          id: 'rec-irrigation',
          category: 'Irrigation',
          priority: 'Low',
          title: 'Maintain Standard Watering Schedule',
          action: 'Continue standard moisture maintenance based on field root checks.',
          reason: 'Balanced atmospheric humidity and moderate temperatures indicate stable water retention.',
          relevantWeather: `Temp: ${temp}°C • Humidity: ${humidity}% • 3-day rain: ${totalUpcomingRain}mm`,
          timing: 'As per routine schedule',
          suitabilityStatus: 'Optimal',
        });
      }

      // 2. Extreme Weather & Heat / Downpour Alerts
      if (totalUpcomingRain > 15 || rain > 10) {
        recommendations.push({
          id: 'rec-heavy-rain',
          category: 'Extreme Weather',
          priority: 'Alert',
          title: 'Heavy Rainfall Warning',
          action: 'Inspect field bunds, secure equipment, and postpone chemical soil applications.',
          reason: `Heavy rainfall (${totalUpcomingRain}mm cumulative) can wash away topsoil fertilizers and induce root asphyxiation.`,
          relevantWeather: `Precipitation volume: ${totalUpcomingRain}mm • Expected rain probability: ${maxUpcomingRainProb}%`,
          timing: 'Immediate Pre-Rainfall Action',
          suitabilityStatus: 'Alert',
        });
      } else if (temp >= 38 || maxUpcomingTemp >= 38) {
        recommendations.push({
          id: 'rec-heatwave',
          category: 'Extreme Weather',
          priority: 'Alert',
          title: 'Extreme Heat Stress Advisory',
          action: 'Avoid chemical spraying during midday; consider mulching to retain soil moisture.',
          reason: 'Severe thermal stress damages pollen fertility and stunts vegetative growth.',
          relevantWeather: `Forecast peak: ${maxUpcomingTemp}°C`,
          timing: 'Midday (11:30 - 15:30)',
          suitabilityStatus: 'Alert',
        });
      }

      // 3. Drainage & Soil Saturation
      const isClay = (soilType || '').toLowerCase().includes('clay');
      if (totalUpcomingRain > 8 || rain > 5) {
        recommendations.push({
          id: 'rec-drainage',
          category: 'Drainage',
          priority: isClay ? 'High' : 'Medium',
          title: isClay ? 'Urgent Clay Soil Drainage Clearance' : 'Inspect Field Drainage Channels',
          action: isClay
            ? 'Clear all furrow ends and drainage trenches immediately to prevent standing water.'
            : 'Ensure drainage furrows allow free gravity discharge away from crop rows.',
          reason: isClay
            ? 'Clay soil exhibits slow water infiltration and high moisture retention. Waterlogging starves crop roots of oxygen within 24 hours.'
            : 'Prevents stagnant puddling around the crop root crown during rainfall.',
          relevantWeather: `Rainfall forecast: ${totalUpcomingRain}mm • Soil profile: ${soilType || 'Farm Soil'}`,
          timing: 'Prior to peak showers',
          suitabilityStatus: 'High Priority',
        });
      }

      // 4. Field Operations (Spraying, Weeding, Fertilizing)
      if (windSpeed > 18) {
        recommendations.push({
          id: 'rec-spraying-wind',
          category: 'Field Operations',
          priority: 'Medium',
          title: 'Postpone Foliar Spraying (High Wind Speed)',
          action: 'Do not spray pesticides, micronutrients, or bio-stimulants until winds subside.',
          reason: `Current wind speed of ${windSpeed} km/h causes severe spray drift away from target foliage and contaminates adjacent plots.`,
          relevantWeather: `Wind speed: ${windSpeed} km/h (threshold is 15 km/h)`,
          timing: 'Resume when wind < 12 km/h',
          suitabilityStatus: 'Avoid Operation',
        });
      } else if (totalUpcomingRain > 5) {
        recommendations.push({
          id: 'rec-fertilizer-leach',
          category: 'Field Operations',
          priority: 'High',
          title: 'Delay Granular Fertilizer Application',
          action: 'Hold off on broadcasting urea or water-soluble NPK fertilizers.',
          reason: 'Precipitation will dissolve and leach mobile nitrogen below the root zone into runoff.',
          relevantWeather: `Rain expected: ${totalUpcomingRain}mm`,
          timing: 'Post-rain field re-entry',
          suitabilityStatus: 'Hold Operation',
        });
      } else {
        recommendations.push({
          id: 'rec-field-suitable',
          category: 'Field Operations',
          priority: 'Low',
          title: 'Favorable Window for Field Operations',
          action: 'Ideal conditions for weeding, foliar spraying, and inter-cultivation.',
          reason: `Calm wind (${windSpeed} km/h), moderate humidity (${humidity}%), and zero rainfall forecast create an effective absorption window.`,
          relevantWeather: `Wind: ${windSpeed} km/h • Humidity: ${humidity}% • Rain: 0mm`,
          timing: 'Morning or late afternoon',
          suitabilityStatus: 'Recommended',
        });
      }

      // 5. Pest & Disease Microclimate Vector Risk
      if (humidity >= 75 && temp >= 24 && temp <= 34) {
        recommendations.push({
          id: 'rec-disease-risk',
          category: 'Pest & Disease',
          priority: 'High',
          title: 'Elevated Fungal & Spore Proliferation Alert',
          action: 'Scout lower canopy leaves for spotting, mildew, or lesions. Avoid overhead sprinkler watering.',
          reason: `Persistent high humidity (${humidity}%) and warm temperatures (${temp}°C) create optimal microclimatic conditions for fungal pathogen germination.`,
          relevantWeather: `Ambient humidity: ${humidity}% • Temperature: ${temp}°C`,
          timing: 'Morning field inspection',
          suitabilityStatus: 'Action Required',
        });
      }

      // Primary summary formulation
      let weatherRecommendation = 'Weather conditions are stable for current farming operations.';
      const highestRec = recommendations.find((r) => r.priority === 'Alert') ||
        recommendations.find((r) => r.priority === 'High');
      if (highestRec) {
        weatherRecommendation = `${highestRec.title}: ${highestRec.action} (${highestRec.reason})`;
      }

      return {
        agentType: 'weather',
        status: 'SUCCESS',
        mode: weatherData.mode, // REAL or DEMO
        confidence: weatherData.isLive ? 95 : 82,
        result: {
          temperature: temp,
          apparentTemperature: current.apparentTemperature,
          humidity,
          rainfall: rain,
          windSpeed,
          windDirection: current.windDirection,
          weatherCondition: current.weatherCondition,
          irrigationRisk,
          diseaseRisk,
          weatherRecommendation,
          stationLocation: weatherData.location,
          station: weatherData.station,
          coordinates: weatherData.coordinates,
          isLive: weatherData.isLive,
          fetchedAt: weatherData.fetchedAt,
          fallbackNotice: weatherData.fallbackNotice,
          forecast7Day,
          hourly24h: weatherData.hourly24h,
          recommendations,
        },
      };
    } catch (error) {
      console.error('[Weather Intelligence Agent] Error:', error.message);
      return {
        agentType: 'weather',
        status: 'TEMPORARILY_UNAVAILABLE',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          temperature: 30,
          humidity: 70,
          rainfall: 0,
          windSpeed: 12,
          weatherCondition: 'Unavailable',
          irrigationRisk: 'Unknown',
          diseaseRisk: 'Unknown',
          weatherRecommendation: 'Weather service temporarily unreachable. Observe localized rainfall before irrigating.',
          stationLocation: 'Offline',
          isLive: false,
          forecast7Day: [],
          recommendations: [],
        },
      };
    }
  }
}

module.exports = new WeatherIntelligenceAgent();
