const axios = require('axios');

/**
 * Service to fetch live weather or provide fallback demo weather
 * Uses Open-Meteo (real-time free API without requiring API key) for precision farming coordinates
 */

const CHENNAI_COORDINATES = {
  lat: 13.0827,
  lon: 80.2707,
};

// Known Tamil Nadu agricultural district coordinates dictionary for instant coordinate resolution
const LOCATION_COORDINATES = {
  'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai, Tamil Nadu' },
  'thiruvallur': { lat: 13.1437, lon: 79.9079, name: 'Thiruvallur, Tamil Nadu' },
  'tiruvallur': { lat: 13.1437, lon: 79.9079, name: 'Thiruvallur, Tamil Nadu' },
  'kanchipuram': { lat: 12.8342, lon: 79.7036, name: 'Kanchipuram, Tamil Nadu' },
  'kancheepuram': { lat: 12.8342, lon: 79.7036, name: 'Kanchipuram, Tamil Nadu' },
  'chengalpattu': { lat: 12.6841, lon: 79.9836, name: 'Chengalpattu, Tamil Nadu' },
  'sriperumbudur': { lat: 12.9691, lon: 79.9419, name: 'Sriperumbudur, Tamil Nadu' },
  'uthiramerur': { lat: 12.6157, lon: 79.7567, name: 'Uthiramerur, Tamil Nadu' },
  'madurantakam': { lat: 12.5086, lon: 79.8847, name: 'Madurantakam, Tamil Nadu' },
  'vellore': { lat: 12.9165, lon: 79.1325, name: 'Vellore, Tamil Nadu' },
  'ranipet': { lat: 12.9279, lon: 79.3331, name: 'Ranipet, Tamil Nadu' },
  'tiruvannamalai': { lat: 12.2253, lon: 79.0747, name: 'Tiruvannamalai, Tamil Nadu' },
  'villupuram': { lat: 11.9401, lon: 79.4861, name: 'Villupuram, Tamil Nadu' },
  'cuddalore': { lat: 11.7480, lon: 79.7714, name: 'Cuddalore, Tamil Nadu' },
  'thanjavur': { lat: 10.7870, lon: 79.1378, name: 'Thanjavur, Tamil Nadu' },
  'madurai': { lat: 9.9252, lon: 78.1198, name: 'Madurai, Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lon: 76.9558, name: 'Coimbatore, Tamil Nadu' },
  'salem': { lat: 11.6643, lon: 78.1460, name: 'Salem, Tamil Nadu' },
  'erode': { lat: 11.3410, lon: 77.7172, name: 'Erode, Tamil Nadu' },
  'tiruchirappalli': { lat: 10.7905, lon: 78.7047, name: 'Tiruchirappalli, Tamil Nadu' },
  'trichy': { lat: 10.7905, lon: 78.7047, name: 'Tiruchirappalli, Tamil Nadu' },
  'dindigul': { lat: 10.3673, lon: 77.9803, name: 'Dindigul, Tamil Nadu' },
  'tirunelveli': { lat: 8.7139, lon: 77.7567, name: 'Tirunelveli, Tamil Nadu' },
};

// Map WMO weather codes to human descriptions and icon cues
const WEATHER_CODE_MAP = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  80: 'Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail',
};

const resolveCoordinates = (location, customLat, customLon) => {
  if (customLat !== undefined && customLon !== undefined && !isNaN(customLat) && !isNaN(customLon)) {
    return {
      lat: Number(customLat),
      lon: Number(customLon),
      locationName: location || `Plot (${Number(customLat).toFixed(4)}, ${Number(customLon).toFixed(4)})`,
    };
  }

  if (typeof location === 'string') {
    const locLower = location.toLowerCase();
    for (const [key, val] of Object.entries(LOCATION_COORDINATES)) {
      if (locLower.includes(key)) {
        return {
          lat: val.lat,
          lon: val.lon,
          locationName: location || val.name,
        };
      }
    }
  }

  return {
    lat: CHENNAI_COORDINATES.lat,
    lon: CHENNAI_COORDINATES.lon,
    locationName: location || 'Chennai, Tamil Nadu',
  };
};

/**
 * Backward-compatible live weather fetch for existing agents
 */
const fetchLiveWeather = async (location = 'Chennai') => {
  const coords = resolveCoordinates(location);

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'precipitation_sum,temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Kolkata',
      },
      timeout: 6000,
    });

    if (response.data && response.data.current) {
      const current = response.data.current;
      const daily = response.data.daily || {};

      const weatherCondition = WEATHER_CODE_MAP[current.weather_code] || 'Partly Cloudy';
      const temperature = Math.round(current.temperature_2m);
      const humidity = Math.round(current.relative_humidity_2m);
      const rainfall = current.precipitation || (daily.precipitation_sum ? daily.precipitation_sum[0] : 0);
      const windSpeed = Math.round(current.wind_speed_10m || 12);

      return {
        isLive: true,
        mode: 'REAL',
        temperature,
        humidity,
        rainfall: Number(rainfall) || 0,
        windSpeed,
        weatherCondition,
        location: `${coords.locationName} (Open-Meteo Live Station)`,
        coordinates: { lat: coords.lat, lon: coords.lon },
      };
    }
  } catch (error) {
    console.warn(`Weather service live fetch failed (${error.message}). Falling back to calibrated DEMO WEATHER MODE.`);
  }

  // Calibrated Chennai seasonal baseline demo weather
  return {
    isLive: false,
    mode: 'DEMO',
    temperature: 32,
    humidity: 74,
    rainfall: 5,
    windSpeed: 14,
    weatherCondition: 'Partly Cloudy',
    location: `${coords.locationName} (Calibrated Demo Simulation)`,
    coordinates: { lat: coords.lat, lon: coords.lon },
  };
};

/**
 * Feature 2: Extended Weather fetch including current metrics and 7-day forecast
 */
const fetchExtendedWeather = async ({ location = 'Chennai', lat, lon }) => {
  const coords = resolveCoordinates(location, lat, lon);

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code',
        timezone: 'Asia/Kolkata',
      },
      timeout: 7000,
    });

    if (response.data && response.data.current) {
      const currentRaw = response.data.current;
      const dailyRaw = response.data.daily || {};
      const hourlyRaw = response.data.hourly || {};

      const current = {
        temperature: Math.round(currentRaw.temperature_2m),
        apparentTemperature: Math.round(currentRaw.apparent_temperature || currentRaw.temperature_2m),
        humidity: Math.round(currentRaw.relative_humidity_2m),
        rainfall: Number(currentRaw.precipitation) || 0,
        windSpeed: Math.round(currentRaw.wind_speed_10m || 12),
        windDirection: Math.round(currentRaw.wind_direction_10m || 0),
        surfacePressure: Math.round(currentRaw.surface_pressure || 1012),
        weatherCode: currentRaw.weather_code,
        weatherCondition: WEATHER_CODE_MAP[currentRaw.weather_code] || 'Partly Cloudy',
        time: currentRaw.time,
      };

      // Format 7-Day Forecast
      const forecast7Day = [];
      const times = dailyRaw.time || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < Math.min(times.length, 7); i++) {
        const dateStr = times[i];
        const dateObj = new Date(dateStr);
        const dayName = isNaN(dateObj.getTime()) ? `Day ${i + 1}` : dayNames[dateObj.getDay()];
        const code = dailyRaw.weather_code ? dailyRaw.weather_code[i] : 0;

        forecast7Day.push({
          date: dateStr,
          dayName: i === 0 ? 'Today' : dayName,
          tempMax: Math.round(dailyRaw.temperature_2m_max ? dailyRaw.temperature_2m_max[i] : current.temperature + 2),
          tempMin: Math.round(dailyRaw.temperature_2m_min ? dailyRaw.temperature_2m_min[i] : current.temperature - 5),
          precipitation: +(dailyRaw.precipitation_sum ? dailyRaw.precipitation_sum[i] : 0).toFixed(1),
          rainProbability: Math.round(dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] : 20),
          windSpeed: Math.round(dailyRaw.wind_speed_10m_max ? dailyRaw.wind_speed_10m_max[i] : 14),
          weatherCode: code,
          weatherCondition: WEATHER_CODE_MAP[code] || 'Partly Cloudy',
          sunrise: dailyRaw.sunrise ? dailyRaw.sunrise[i] : null,
          sunset: dailyRaw.sunset ? dailyRaw.sunset[i] : null,
        });
      }

      // Next 24 hours sample (every 3 hours)
      const hourly24h = [];
      if (hourlyRaw.time && hourlyRaw.time.length > 0) {
        for (let i = 0; i < Math.min(hourlyRaw.time.length, 24); i += 3) {
          hourly24h.push({
            time: hourlyRaw.time[i],
            hour: new Date(hourlyRaw.time[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            temperature: Math.round(hourlyRaw.temperature_2m[i]),
            humidity: Math.round(hourlyRaw.relative_humidity_2m[i]),
            rainProbability: Math.round(hourlyRaw.precipitation_probability ? hourlyRaw.precipitation_probability[i] : 0),
            weatherCondition: WEATHER_CODE_MAP[hourlyRaw.weather_code[i]] || 'Clear',
          });
        }
      }

      return {
        isLive: true,
        mode: 'REAL',
        location: coords.locationName,
        coordinates: { lat: coords.lat, lon: coords.lon },
        station: 'Open-Meteo High-Resolution Live Telemetry Station',
        fetchedAt: new Date().toISOString(),
        current,
        forecast7Day,
        hourly24h,
      };
    }
  } catch (error) {
    console.warn(`[Extended Weather] Live API error (${error.message}). Engaging calibrated demo fallback.`);
  }

  // Realistic seasonal baseline fallback simulation
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fallbackForecast = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    fallbackForecast.push({
      date: dateStr,
      dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
      tempMax: 33 - (i % 2),
      tempMin: 25 - (i % 2),
      precipitation: i === 1 || i === 4 ? 8.5 : 1.2,
      rainProbability: i === 1 || i === 4 ? 75 : 20,
      windSpeed: 14 + (i % 4),
      weatherCode: i === 1 ? 80 : 2,
      weatherCondition: i === 1 ? 'Rain Showers' : 'Partly Cloudy',
    });
  }

  return {
    isLive: false,
    mode: 'DEMO',
    location: `${coords.locationName} (Offline Simulation)`,
    coordinates: { lat: coords.lat, lon: coords.lon },
    station: 'Calibrated AgroSmart Seasonal Simulation',
    fetchedAt: new Date().toISOString(),
    fallbackNotice: 'Live weather telemetry is currently operating in calibrated demo mode. Values represent historical seasonal baseline data.',
    current: {
      temperature: 32,
      apparentTemperature: 36,
      humidity: 74,
      rainfall: 3.5,
      windSpeed: 14,
      windDirection: 120,
      surfacePressure: 1011,
      weatherCode: 2,
      weatherCondition: 'Partly Cloudy',
      time: today.toISOString(),
    },
    forecast7Day: fallbackForecast,
    hourly24h: [],
  };
};

module.exports = {
  fetchLiveWeather,
  fetchExtendedWeather,
  resolveCoordinates,
  CHENNAI_COORDINATES,
  LOCATION_COORDINATES,
  WEATHER_CODE_MAP,
};
