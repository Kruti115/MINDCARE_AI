// src/utils/moodStorage.js - UPDATED: saves input data for "View More"
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save a mood entry to history.
 *
 * @param {object} data        - The analysis result data from backend
 * @param {object} inputData   - Optional input details to show in "View More":
 *   {
 *     inputText?: string,       // full text the user typed
 *     inputImageUri?: string,   // local URI of image used
 *     hasAudio?: boolean,       // whether audio was included
 *     hasVideo?: boolean,       // whether video was included
 *   }
 */
export const saveMoodEntry = async (data, inputData = {}) => {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      emotion: data.emotion?.primary || data.emotion,
      confidence: data.emotion?.confidence || 0,
      wellnessScore: data.wellness_score || 5.0,
      modality: data.modality || 'unknown',
      interpretation: data.interpretation || '',

      // ✅ Input details for "View More" in MoodTrackingScreen
      inputText: inputData.inputText || null,
      inputImageUri: inputData.inputImageUri || null,
      hasAudio: inputData.hasAudio || false,
      hasVideo: inputData.hasVideo || false,
    };

    const existingHistory = await AsyncStorage.getItem('moodHistory');
    let history = existingHistory ? JSON.parse(existingHistory) : [];

    history.unshift(entry);

    if (history.length > 100) {
      history = history.slice(0, 100);
    }

    await AsyncStorage.setItem('moodHistory', JSON.stringify(history));
    console.log('✅ Mood entry saved with input data');
    return true;
  } catch (error) {
    console.error('❌ Error saving mood entry:', error);
    return false;
  }
};