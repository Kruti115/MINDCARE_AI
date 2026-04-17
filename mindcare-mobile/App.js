// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';

// Suppress known Expo Go warning about push notifications — local notifications still work
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications] `shouldShowAlert`',
]);
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { initNotifications } from './src/utils/notifications';

// Screens
import OnboardingScreen           from './src/screens/OnboardingScreen';
import HomeScreen                 from './src/screens/HomeScreen';
import TextAnalysisScreen         from './src/screens/TextAnalysisScreen';
import AudioAnalysisScreen        from './src/screens/AudioAnalysisScreen';
import VideoAnalysisScreen        from './src/screens/VideoAnalysisScreen';
import MultimodalAnalysisScreen   from './src/screens/MultimodalAnalysisScreen';
import MoodTrackingScreen         from './src/screens/MoodTrackingScreen';
import HelplineScreen             from './src/screens/HelplineScreen';
import SettingsScreen             from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // null = loading

  useEffect(() => {
    const bootstrap = async () => {
      // Init notifications (non-blocking — errors are caught inside)
      initNotifications();

      // Check if user has already seen onboarding
      try {
        const seen = await AsyncStorage.getItem('hasOnboarded');
        setInitialRoute(seen === 'true' ? 'Home' : 'Onboarding');
      } catch {
        setInitialRoute('Home'); // fallback
      }
    };
    bootstrap();
  }, []);

  // Show blank loading screen while checking AsyncStorage
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4A90D9' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Onboarding"         component={OnboardingScreen} />
        <Stack.Screen name="Home"               component={HomeScreen} />
        <Stack.Screen name="TextAnalysis"       component={TextAnalysisScreen} />
        <Stack.Screen name="AudioAnalysis"      component={AudioAnalysisScreen} />
        <Stack.Screen name="VideoAnalysis"      component={VideoAnalysisScreen} />
        <Stack.Screen name="MultimodalAnalysis" component={MultimodalAnalysisScreen} />
        <Stack.Screen name="MoodTracking"       component={MoodTrackingScreen} />
        <Stack.Screen name="Helpline"           component={HelplineScreen} />
        <Stack.Screen name="Settings"           component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}