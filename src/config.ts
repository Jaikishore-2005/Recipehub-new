// API configuration
const config = {
  // API URL - change this to your deployed backend URL when deploying
  API_URL: import.meta.env.VITE_API_URL || 'https://recipehub-api-v64j.onrender.com',
  
  // Default headers for API requests
  API_HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default config; 