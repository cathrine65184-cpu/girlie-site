import { useEffect, useState } from 'react';

const cache = new Map();

const conditionForCode = (code) => {
  if (code === 0) return ['☀️', 'Clear'];
  if (code <= 2) return ['🌤️', 'Partly cloudy'];
  if (code === 3) return ['☁️', 'Overcast'];
  if (code <= 48) return ['🌫️', 'Misty'];
  if (code <= 57) return ['🌦️', 'Drizzle'];
  if (code <= 67) return ['🌧️', 'Rain'];
  if (code <= 77) return ['❄️', 'Snow'];
  if (code <= 82) return ['🌦️', 'Showers'];
  return ['⛈️', 'Thunderstorm'];
};

function fallback(girl) {
  return { label: girl.climate, live: false };
}

/** Open-Meteo is public, keyless, and leaves no secret in the browser. */
export function useWeather(girl) {
  const cacheKey = `${girl.latitude},${girl.longitude}`;
  const [weather, setWeather] = useState(() => cache.get(cacheKey) || fallback(girl));

  useEffect(() => {
    let cancelled = false;
    if (cache.has(cacheKey)) { setWeather(cache.get(cacheKey)); return undefined; }
    const controller = new AbortController();
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${girl.latitude}&longitude=${girl.longitude}&current=temperature_2m,weather_code&timezone=auto`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Weather unavailable')))
      .then((data) => {
        const current = data?.current;
        if (!current || !Number.isFinite(current.temperature_2m)) throw new Error('Weather unavailable');
        const [icon, condition] = conditionForCode(current.weather_code);
        const next = { label: `${icon} ${Math.round(current.temperature_2m)}°C · ${condition}`, live: true };
        cache.set(cacheKey, next);
        if (!cancelled) setWeather(next);
      })
      .catch(() => { if (!cancelled) setWeather(fallback(girl)); });
    return () => { cancelled = true; controller.abort(); };
  }, [cacheKey, girl]);

  return weather;
}
