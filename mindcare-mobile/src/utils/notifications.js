// src/utils/notifications.js
// LOCAL scheduled notifications only — no push tokens, works in Expo Go

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const NOTIF_KEY      = 'notificationsEnabled';
const NOTIF_TIME_KEY = 'notificationTime';
const DEFAULT_HOUR   = 20;
const DEFAULT_MINUTE = 0;

// Show notifications when app is in foreground (no deprecated shouldShowAlert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
});

// ── Permission ─────────────────────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
};

// ── Schedule daily reminder ────────────────────────────────────────────────
export const scheduleDailyReminder = async (hour = DEFAULT_HOUR, minute = DEFAULT_MINUTE) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Permission Needed',
        'Please enable notifications in your device settings to receive daily reminders.',
      );
      return false;
    }

    // DAILY trigger — fires once per day at set time, NOT when phone is off
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'MindCare AI — Daily Check-in',
        body:  'How are you feeling today? Take a moment to check in with yourself.',
        sound: false,
        data:  { screen: 'Home' },
        ...(Platform.OS === 'android' && { channelId: 'daily-checkin' }),
      },
      trigger: {
        type:   Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await AsyncStorage.setItem(NOTIF_KEY, 'true');
    await AsyncStorage.setItem(NOTIF_TIME_KEY, JSON.stringify({ hour, minute }));
    return true;
  } catch (e) {
    console.error('scheduleDailyReminder error:', e);
    return false;
  }
};

// ── Cancel all reminders ───────────────────────────────────────────────────
export const cancelReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(NOTIF_KEY, 'false');
  } catch (e) {
    console.error('cancelReminders error:', e);
  }
};

// ── Get current settings ───────────────────────────────────────────────────
export const getNotificationSettings = async () => {
  try {
    const enabled = await AsyncStorage.getItem(NOTIF_KEY);
    const timeRaw = await AsyncStorage.getItem(NOTIF_TIME_KEY);
    const time    = timeRaw
      ? JSON.parse(timeRaw)
      : { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
    return { enabled: enabled === 'true', time };
  } catch {
    return { enabled: false, time: { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE } };
  }
};

// ── Android channel + re-schedule on app start ─────────────────────────────
export const initNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-checkin', {
        name:             'Daily Check-in Reminders',
        importance:       Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       '#4A90D9',
        sound:            null,
      });
    }
    const { enabled, time } = await getNotificationSettings();
    if (enabled) await scheduleDailyReminder(time.hour, time.minute);
  } catch (e) {
    console.warn('initNotifications (non-fatal):', e);
  }
};

// ── Format time helper ─────────────────────────────────────────────────────
export const formatNotifTime = ({ hour, minute }) => {
  const h    = hour % 12 || 12;
  const m    = String(minute).padStart(2, '0');
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${m} ${ampm}`;
};