export function verifyApiKey(apiKey) {
  const validApiKey = process.env.API_KEY;
  
  // Basic validation
  if (!apiKey || typeof apiKey !== 'string') {
    console.warn('Missing or invalid API key format');
    return false;
  }

  if (!validApiKey) {
    console.error('API_KEY not set in environment variables');
    return false;
  }

  // Allow bypass in development only if explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
    console.warn('Auth bypass enabled in development');
    return true;
  }

  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== validApiKey.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ validApiKey.charCodeAt(i);
  }
  
  return result === 0;
}
