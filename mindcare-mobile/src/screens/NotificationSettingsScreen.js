// src/screens/NotificationSettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Switch, ScrollView, StatusBar, Alert,
} from 'react-native';
import {
  getNotificationSettings, scheduleDailyReminder,
  cancelReminders, formatNotifTime,
} from '../utils/notifications';
import { C } from '../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function NotificationSettingsScreen({ navigation }) {
  const [enabled, setEnabled]     = useState(false);
  const [hour, setHour]           = useState(20);
  const [minute, setMinute]       = useState(0);
  const [saving, setSaving]       = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { enabled: e, time } = await getNotificationSettings();
    setEnabled(e); setHour(time.hour); setMinute(time.minute);
  };

  const toggleEnabled = async (val) => {
    setEnabled(val);
    if (!val) {
      await cancelReminders();
      Alert.alert('Reminders Off', 'Daily check-in reminders have been turned off.');
    } else {
      const success = await scheduleDailyReminder(hour, minute);
      if (!success) setEnabled(false);
      else Alert.alert('Reminders On', `You will be reminded daily at ${formatNotifTime({ hour, minute })}.`);
    }
  };

  const saveTime = async () => {
    setSaving(true);
    setShowPicker(false);
    if (enabled) {
      const success = await scheduleDailyReminder(hour, minute);
      if (success) Alert.alert('Saved', `Reminder updated to ${formatNotifTime({ hour, minute })}.`);
    }
    setSaving(false);
  };

  const fmt12 = h => {
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12  = h % 12 || 12;
    return `${h12} ${ampm}`;
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={s.header}>
        <View style={s.decor} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reminders</Text>
        <Text style={s.headerSub}>Daily check-in notifications</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.body}>

          {/* Toggle */}
          <View style={s.card}>
            <View style={s.toggleRow}>
              <View>
                <Text style={s.toggleLabel}>Daily Reminder</Text>
                <Text style={s.toggleDesc}>Get a daily nudge to check in</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={toggleEnabled}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Time picker */}
          <View style={[s.card, !enabled && s.cardDisabled]}>
            <Text style={s.cardTitle}>Reminder Time</Text>
            <TouchableOpacity
              style={s.timeDisplay}
              onPress={() => enabled && setShowPicker(v => !v)}
              activeOpacity={enabled ? 0.85 : 1}
            >
              <Text style={[s.timeTxt, !enabled && { color: C.textLight }]}>
                {formatNotifTime({ hour, minute })}
              </Text>
              {enabled && <Text style={s.timeChevron}>{showPicker ? '▲' : '▼'}</Text>}
            </TouchableOpacity>

            {showPicker && enabled && (
              <View style={s.picker}>
                {/* Hour row */}
                <Text style={s.pickerLabel}>Hour</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickerRow}>
                  {HOURS.map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[s.pickerChip, h === hour && s.pickerChipActive]}
                      onPress={() => setHour(h)}
                      activeOpacity={0.85}
                    >
                      <Text style={[s.pickerChipTxt, h === hour && s.pickerChipTxtActive]}>
                        {fmt12(h)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Minute row */}
                <Text style={[s.pickerLabel, { marginTop: 12 }]}>Minute</Text>
                <View style={s.minuteRow}>
                  {MINUTES.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[s.pickerChip, m === minute && s.pickerChipActive]}
                      onPress={() => setMinute(m)}
                      activeOpacity={0.85}
                    >
                      <Text style={[s.pickerChipTxt, m === minute && s.pickerChipTxtActive]}>
                        :{String(m).padStart(2,'0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[s.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={saveTime} disabled={saving} activeOpacity={0.85}
                >
                  <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save Time'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info card */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>About Reminders</Text>
            <Text style={s.infoTxt}>• Reminders repeat every day at your chosen time</Text>
            <Text style={s.infoTxt}>• Tap the notification to open MindCare AI directly</Text>
            <Text style={s.infoTxt}>• You can turn them off anytime from here</Text>
            <Text style={s.infoTxt}>• Notifications are silent — no sound, no vibration</Text>
          </View>

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  header:           { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:            { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:          { marginBottom: 10 },
  backTxt:          { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:      { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:        { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  scroll:           { flex: 1 },
  body:             { padding: 16, gap: 12 },
  card:             { backgroundColor: C.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border },
  cardDisabled:     { opacity: 0.5 },
  cardTitle:        { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
  toggleRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel:      { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  toggleDesc:       { fontSize: 12, color: C.textMid },
  timeDisplay:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 12, padding: 14 },
  timeTxt:          { fontSize: 28, fontWeight: '700', color: C.primary },
  timeChevron:      { fontSize: 12, color: C.primary },
  picker:           { marginTop: 16 },
  pickerLabel:      { fontSize: 11, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  pickerRow:        { flexDirection: 'row' },
  pickerChip:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg, marginRight: 8, borderWidth: 1, borderColor: C.border },
  pickerChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  pickerChipTxt:    { fontSize: 12, color: C.textMid, fontWeight: '600' },
  pickerChipTxtActive: { color: '#fff' },
  minuteRow:        { flexDirection: 'row', gap: 8 },
  saveBtn:          { marginTop: 16, backgroundColor: C.primary, borderRadius: 12, padding: 13, alignItems: 'center' },
  saveBtnTxt:       { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoCard:         { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary, gap: 6 },
  infoTitle:        { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4 },
  infoTxt:          { fontSize: 12, color: C.textMid, lineHeight: 19 },
});