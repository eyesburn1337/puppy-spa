const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://puppy-spa-api.onrender.com/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('Environment Variables:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  DEFAULT_API_URL
});

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: Boolean(process.env.VERCEL)
}; 