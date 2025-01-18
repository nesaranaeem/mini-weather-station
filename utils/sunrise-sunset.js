const BASE_URL = 'https://api.sunrise-sunset.org/json';

export async function getSunriseSunset(lat = 36.7201600, lng = -4.4203400) {
  try {
    const timezone = localStorage.getItem('timezone') || 'Asia/Dhaka';
    const url = `${BASE_URL}?lat=${lat}&lng=${lng}&formatted=0&tzid=${timezone}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return {
        ...data.results,
        timezone
      };
    }
    throw new Error('Failed to fetch sunrise-sunset data');
  } catch (error) {
    console.error('Error fetching sunrise-sunset data:', error);
    return null;
  }
}
