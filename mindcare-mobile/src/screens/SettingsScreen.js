// src/screens/SettingsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, StatusBar, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {
  getNotificationSettings, scheduleDailyReminder,
  cancelReminders, formatNotifTime,
} from '../utils/notifications';
import { C } from '../theme';

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const fmt12 = h => {
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12} ${ampm}`;
};

export default function SettingsScreen({ navigation }) {
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [hour, setHour]                 = useState(20);
  const [minute, setMinute]             = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving]             = useState(false);

  useFocusEffect(useCallback(() => {
    getNotificationSettings().then(({ enabled, time }) => {
      setNotifEnabled(enabled);
      setHour(time.hour);
      setMinute(time.minute);
    });
  }, []));

  const toggleNotif = async (val) => {
    setNotifEnabled(val);
    if (!val) {
      await cancelReminders();
    } else {
      const ok = await scheduleDailyReminder(hour, minute);
      if (!ok) setNotifEnabled(false);
    }
  };

  const saveTime = async () => {
    setSaving(true);
    setShowTimePicker(false);
    if (notifEnabled) {
      await scheduleDailyReminder(hour, minute);
      Alert.alert('Saved', `Reminder updated to ${formatNotifTime({ hour, minute })}.`);
    }
    setSaving(false);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerDecor} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={s.backTxt}> Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <Text style={s.headerSub}>Manage your MindCare preferences</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.body}>

          {/* ── Notifications ── */}
          <Text style={s.groupLabel}>NOTIFICATIONS</Text>
          <View style={s.card}>

            {/* Toggle */}
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={[s.rowIcon, { backgroundColor: '#EBF4FF' }]}>
                  <Icon name="bell-outline" size={20} color={C.primary} />
                </View>
                <View>
                  <Text style={s.rowLabel}>Daily Reminder</Text>
                  <Text style={s.rowDesc}>Check-in nudge every day</Text>
                </View>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={toggleNotif}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* Time row — only shown when enabled */}
            {notifEnabled && (
              <>
                <View style={s.divider} />
                <TouchableOpacity
                  style={s.row}
                  onPress={() => setShowTimePicker(v => !v)}
                  activeOpacity={0.85}
                >
                  <View style={s.rowLeft}>
                    <View style={[s.rowIcon, { backgroundColor: '#E3F9F5' }]}>
                      <Icon name="clock-outline" size={20} color={C.accentGreen} />
                    </View>
                    <View>
                      <Text style={s.rowLabel}>Reminder Time</Text>
                      <Text style={[s.rowDesc, { color: C.primary, fontWeight: '600' }]}>
                        {formatNotifTime({ hour, minute })}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.chevron}>{showTimePicker ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <View style={s.timePicker}>
                    <Text style={s.pickerLabel}>Hour</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={s.chipRow}>
                        {HOURS.map(h => (
                          <TouchableOpacity
                            key={h}
                            style={[s.chip, h === hour && s.chipActive]}
                            onPress={() => setHour(h)}
                          >
                            <Text style={[s.chipTxt, h === hour && s.chipTxtActive]}>
                              {fmt12(h)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    <Text style={[s.pickerLabel, { marginTop: 12 }]}>Minute</Text>
                    <View style={s.chipRow}>
                      {MINUTES.map(m => (
                        <TouchableOpacity
                          key={m}
                          style={[s.chip, m === minute && s.chipActive]}
                          onPress={() => setMinute(m)}
                        >
                          <Text style={[s.chipTxt, m === minute && s.chipTxtActive]}>
                            :{String(m).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[s.saveBtn, saving && { opacity: 0.6 }]}
                      onPress={saveTime}
                      disabled={saving}
                      activeOpacity={0.85}
                    >
                      <Text style={s.saveBtnTxt}>{saving ? 'Saving…' : 'Save Time'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── Data ── */}
          <Text style={s.groupLabel}>DATA</Text>
          <View style={s.card}>
            <TouchableOpacity
              style={s.row}
              onPress={() => navigation.navigate('MoodTracking')}
              activeOpacity={0.85}
            >
              <View style={s.rowLeft}>
                <View style={[s.rowIcon, { backgroundColor: '#EEF0FF' }]}>
                  <Icon name="chart-line" size={20} color={C.purple} />
                </View>
                <View>
                  <Text style={s.rowLabel}>Mood History</Text>
                  <Text style={s.rowDesc}>View and export your records</Text>
                </View>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ── About ── */}
          <Text style={s.groupLabel}>ABOUT</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={[s.rowIcon, { backgroundColor: '#FFF0EE' }]}>
                  <Icon name="information-outline" size={20} color={C.accentRed} />
                </View>
                <View>
                  <Text style={s.rowLabel}>MindCare AI</Text>
                  <Text style={s.rowDesc}>Version 1.0.0</Text>
                </View>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={[s.rowIcon, { backgroundColor: '#E3F9F5' }]}>
                  <Icon name="school-outline" size={20} color={C.accentGreen} />
                </View>
                <View>
                  <Text style={s.rowLabel}>Project</Text>
                  <Text style={s.rowDesc}>B.Tech Final Year Dissertation</Text>
                </View>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={[s.rowIcon, { backgroundColor: '#EBF4FF' }]}>
                  <Icon name="account-outline" size={20} color={C.primary} />
                </View>
                <View>
                  <Text style={s.rowLabel}>Developed by</Text>
                  <Text style={s.rowDesc}>Gupta Kruti Narendra · 22C22005</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  header:       { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  headerDecor:  { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backTxt:      { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:  { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:    { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  scroll:       { flex: 1 },
  body:         { padding: 16 },

  groupLabel:   { fontSize: 11, fontWeight: '700', color: C.textLight, letterSpacing: 1.1, marginTop: 20, marginBottom: 8, marginLeft: 4 },
  card:         { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  divider:      { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon:      { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  rowLabel:     { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  rowDesc:      { fontSize: 12, color: C.textMid },
  chevron:      { fontSize: 18, color: C.textLight, fontWeight: '600' },

  timePicker:   { paddingHorizontal: 14, paddingBottom: 14 },
  pickerLabel:  { fontSize: 11, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  chipRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.primary, borderColor: C.primary },
  chipTxt:      { fontSize: 12, color: C.textMid, fontWeight: '600' },
  chipTxtActive:{ color: '#fff' },
  saveBtn:      { marginTop: 16, backgroundColor: C.primary, borderRadius: 12, padding: 13, alignItems: 'center' },
  saveBtnTxt:   { color: '#fff', fontSize: 14, fontWeight: '700' },
});