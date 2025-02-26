import { config } from '@/config/environment';

const API_BASE_URL = config.apiUrl;
console.log('API Base URL:', API_BASE_URL);

export const apiClient = {
  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making GET request to:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(endpoint: string, data?: any) {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('Making PUT request to:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      console.error('API client error:', error);
      throw error;
    }
  }
}; 