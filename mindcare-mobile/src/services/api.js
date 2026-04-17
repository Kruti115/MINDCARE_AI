// src/services/api.js
import axios from 'axios';

// Your Hugging Face Backend URL
const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// Check if backend is online
export const isOnline = async () => {
  try {
    console.log('🔍 Checking backend connection...');
    console.log('📍 API URL:', API_BASE_URL);
    
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000, // 5 second timeout
    });
    
    console.log('✅ Backend is online:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend offline or unreachable:', error.message);
    return false;
  }
};

// Analyze text emotion
export const analyzeText = async (text, userId = 'user123') => {
  try {
    console.log('📤 Sending text to backend...');
    
    const response = await axios.post(
      `${API_BASE_URL}/analyze-text`,
      {
        text: text,
        user_id: userId,
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Response received:', response.data);
    
    return {
      success: true,
      data: {
        ...response.data.data,
        mode: 'online',
      },
    };
  } catch (error) {
    console.error('❌ Text analysis error:', error.message);
    
    if (error.response) {
      console.error('Backend error:', error.response.data);
    }
    
    throw error;
  }
};

export default {
  isOnline,
  analyzeText,
};