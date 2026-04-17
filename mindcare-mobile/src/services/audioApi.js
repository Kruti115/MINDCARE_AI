// src/services/audioApi.js
import axios from 'axios';

const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

export const analyzeAudio = async (audioUri, userId = 'user123') => {
  try {
    console.log('🎤 Preparing audio upload...');
    console.log('📍 Backend URL:', API_BASE_URL);
    console.log('📁 Audio URI:', audioUri);
    
    // Create FormData
    const formData = new FormData();
    
    // Determine file extension and type
    let fileExtension = '.wav';
    let mimeType = 'audio/wav';
    
    if (audioUri.includes('.m4a')) {
      fileExtension = '.m4a';
      mimeType = 'audio/m4a';
    } else if (audioUri.includes('.mp3')) {
      fileExtension = '.mp3';
      mimeType = 'audio/mpeg';
    }
    
    console.log('📋 File type:', mimeType);
    
    // Create file object with proper format
    const audioFile = {
      uri: audioUri,
      type: mimeType,
      name: `recording${fileExtension}`,
    };
    
    formData.append('audio_file', audioFile);
    formData.append('user_id', userId);
    
    console.log('📤 Uploading to backend...');
    
    // Make request with extended timeout
    const response = await axios.post(
      `${API_BASE_URL}/analyze-audio`,
      formData,
      {
        timeout: 90000, // 90 seconds
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          // Let axios handle FormData
          return data;
        },
      }
    );
    
    console.log('✅ Audio analysis response:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Audio analysis error:', error.message);
    
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      console.error('Status code:', error.response.status);
      
      // More specific error messages
      if (error.response.status === 500) {
        throw new Error('Backend processing error. The audio format may not be supported.');
      } else if (error.response.status === 400) {
        throw new Error('Invalid audio file. Please try recording again.');
      }
    } else if (error.request) {
      console.error('No response from backend');
      throw new Error('Cannot reach backend. Please check your internet connection.');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
};

export const getWellnessColor = (score) => {
  if (score >= 7) return '#4CAF50';
  if (score >= 4) return '#FFC107';
  return '#F44336';
};

export const formatEmotion = (emotion) => {
  const emotionMap = {
    'happy': '😊 Happy',
    'sad': '😢 Sad',
    'angry': '😠 Angry',
    'fearful': '😰 Fearful',
    'disgust': '🤢 Disgust',
    'neutral': '😐 Neutral',
    'calm': '😌 Calm',
    'joy': '😄 Joy',
    'anxiety': '😟 Anxious',
  };
  
  return emotionMap[emotion.toLowerCase()] || emotion;
};

export const getEmotionEmoji = (emotion) => {
  const emojiMap = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'fearful': '😰',
    'disgust': '🤢',
    'neutral': '😐',
    'calm': '😌',
    'joy': '😄',
    'anxiety': '😟',
  };
  
  return emojiMap[emotion.toLowerCase()] || '😐';
};