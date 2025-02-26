console.log('Environment Variables:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL
});

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || (
    process.env.VERCEL 
      ? 'https://puppy-spa-api.onrender.com/api'
      : 'http://localhost:3001/api'
  ),
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: Boolean(process.env.VERCEL)
}; 