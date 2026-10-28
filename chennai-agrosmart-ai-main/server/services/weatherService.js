const axios = require('axios');

/**
 * Service to fetch live weather or provide fallback demo weather
 * Uses Open-Meteo (real-time free API without requiring API key) for Chennai coordinates
 * Coordinates for Chennai: lat: 13.0827, lon: 80.2707
 */

const CHENNAI_COORDINATES = {
  lat: 13.0827,
  lon: 80.2707,
};

const LOCATION_COORDINATES = {
  chennai: { lat: 13.0827, lon: 80.2707, locationName: 'Chennai, Tamil Nadu' },
  thiruvallur: { lat: 13.1437, lon: 79.9079, locationName: 'Thiruvallur, Tamil Nadu' },
  kanchipuram: { lat: 12.8342, lon: 79.7036, locationName: 'Kanchipuram, Tamil Nadu' },
  chengalpattu: { lat: 12.6841, lon: 79.9836, locationName: 'Chengalpattu, Tamil Nadu' },
};

const resolveCoordinates = (location = 'Chennai', lat, lon) => {
  if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
    return { lat: Number(lat), lon: Number(lon), locationName: location };
  }
  const normalized = (location || '').toLowerCase();
  for (const [key, val] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key)) {
      return val;
    }
  }
  return {
    lat: CHENNAI_COORDINATES.lat,
    lon: CHENNAI_COORDINATES.lon,
    locationName: location || 'Chennai, Tamil Nadu',
  };
};

const weatherMap = {

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
  82: 'Violent Showers',
  95: 'Thunderstorm',
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fetchLiveWeather = async (location = 'Chennai') => {
  const coords = resolveCoordinates(location);
  try {
    // Attempt Open-Meteo live call
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        timezone: 'Asia/Kolkata',
        forecast_days: 7,
      },
      timeout: 8000,
    });


    if (response.data && response.data.current) {
      const current = response.data.current;
      const daily = response.data.daily || {};
      const hourly = response.data.hourly || {};

      const weatherCondition = weatherMap[current.weather_code] || 'Partly Cloudy';
      const temperature = Math.round(current.temperature_2m);
      const apparentTemperature = Math.round(current.apparent_temperature ?? temperature);
      const humidity = Math.round(current.relative_humidity_2m);
      const rainfall = Number(current.precipitation || (daily.precipitation_sum ? daily.precipitation_sum[0] : 0)) || 0;
      const windSpeed = Math.round(current.wind_speed_10m || 12);
      const windDirection = Math.round(current.wind_direction_10m || 0);

      // Build 7-day forecast array
      const forecast7Day = (daily.time || []).map((dateStr, i) => {
        const d = new Date(dateStr);
        return {
          dayName: dayNames[d.getDay()] || 'Day',
          date: dateStr,
          weatherCondition: weatherMap[daily.weather_code?.[i]] || 'Partly Cloudy',
          tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 33),
          tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 24),
          precipitation: Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
          rainProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 10),
        };
      });

      // Build next 24 hours intervals
      const hourlyTimes = hourly.time || [];
      const hourly24h = [];
      const currentHour = new Date().getHours();
      for (let i = 0; i < Math.min(24, hourlyTimes.length); i++) {
        const idx = (currentHour + i) % hourlyTimes.length;
        const timeStr = hourlyTimes[idx] || '';
        const hourLabel = timeStr.includes('T') ? timeStr.split('T')[1].slice(0, 5) : `${String((currentHour + i) % 24).padStart(2, '0')}:00`;
        hourly24h.push({
          hour: hourLabel,
          temperature: Math.round(hourly.temperature_2m?.[idx] ?? temperature),
          weatherCondition: weatherMap[hourly.weather_code?.[idx]] || weatherCondition,
          rainProbability: Math.round(hourly.precipitation_probability?.[idx] ?? 5),
        });
      }

      return {
        isLive: true,
        mode: 'REAL',
        temperature,
        apparentTemperature,
        humidity,
        rainfall,
        windSpeed,
        windDirection,
        weatherCondition,
        forecast7Day,
        hourly24h,
        location: `${location} (Open-Meteo Live Station)`,
      };
    }
  } catch (error) {
    console.warn(`Weather service live fetch failed (${error.message}). Falling back to calibrated DEMO WEATHER MODE.`);
  }

  // Calibrated Chennai seasonal baseline demo weather
  const baseDate = new Date();
  const demoForecast = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return {
      dayName: dayNames[d.getDay()],
      date: d.toISOString().split('T')[0],
      weatherCondition: i % 2 === 0 ? 'Partly Cloudy' : 'Clear Sky',
      tempMax: 33 - (i % 3),
      tempMin: 25 - (i % 2),
      precipitation: i === 2 ? 4.2 : 0.2,
      rainProbability: i === 2 ? 45 : 10,
    };
  });

  const demoHourly = Array.from({ length: 8 }).map((_, i) => {
    const hour = (new Date().getHours() + i * 3) % 24;
    return {
      hour: `${String(hour).padStart(2, '0')}:00`,
      temperature: 30 - (i % 4),
      weatherCondition: 'Partly Cloudy',
      rainProbability: 15,
    };
  });

  return {
    isLive: false,
    mode: 'DEMO',
    temperature: 32,
    apparentTemperature: 35,
    humidity: 74,
    rainfall: 0,
    windSpeed: 14,
    windDirection: 180,
    weatherCondition: 'Partly Cloudy',
    forecast7Day: demoForecast,
    hourly24h: demoHourly,
    location: `${location} (Calibrated Demo Simulation)`,
  };
};

const fetchExtendedWeather = async ({ location = 'Chennai', lat, lon } = {}) => {
  const result = await fetchLiveWeather(location);
  return {
    ...result,
    current: {
      temperature: result.temperature,
      apparentTemperature: result.apparentTemperature,
      humidity: result.humidity,
      rainfall: result.rainfall,
      windSpeed: result.windSpeed,
      windDirection: result.windDirection,
      weatherCondition: result.weatherCondition,
    },
  };
};

module.exports = {
  fetchLiveWeather,
  fetchExtendedWeather,
  resolveCoordinates,
  CHENNAI_COORDINATES,
  LOCATION_COORDINATES,
  weatherMap,
  WEATHER_CODE_MAP: weatherMap,
};



