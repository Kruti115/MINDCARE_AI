// src/screens/CrisisSupportScreen.js
// Full crisis helpline screen — accessible from Home and auto-triggered by low wellness
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Alert, StatusBar,
} from 'react-native';
import { C } from '../theme';

const HELPLINES = [
  {
    category:  'India — National',
    items: [
      { name: 'iCall (TISS)', number: '9152987821', desc: 'Psychological counselling & support', available: 'Mon–Sat, 8am–10pm' },
      { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 mental health helpline', available: '24/7' },
      { name: 'NIMHANS', number: '080-46110007', desc: 'National mental health helpline', available: '24/7' },
      { name: 'Snehi', number: '044-24640050', desc: 'Emotional support helpline', available: 'Daily, 8am–10pm' },
    ],
  },
  {
    category: 'Suicide Prevention',
    items: [
      { name: 'Aasra', number: '9820466627', desc: 'Suicide prevention & crisis support', available: '24/7' },
      { name: 'iCall Crisis Line', number: '9152987821', desc: 'Crisis intervention & counselling', available: 'Mon–Sat, 8am–10pm' },
    ],
  },
  {
    category: 'Emergency',
    items: [
      { name: 'Emergency Services', number: '112', desc: 'Police, ambulance, fire', available: '24/7' },
      { name: 'Ambulance', number: '108', desc: 'Medical emergency', available: '24/7' },
    ],
  },
];

const SELF_CARE = [
  { icon: '🌬️', tip: 'Try box breathing: Inhale 4s → Hold 4s → Exhale 4s → Hold 4s' },
  { icon: '🚶', tip: 'Take a short walk, even 5 minutes can shift your mood' },
  { icon: '💧', tip: 'Drink a glass of water and take a few slow breaths' },
  { icon: '📞', tip: 'Call someone you trust — connection matters' },
  { icon: '✍️', tip: 'Write down three things you\'re feeling right now' },
  { icon: '🎵', tip: 'Put on calming music or a familiar comfort show' },
];

function HelplineCard({ item }) {
  const call = () => {
    Alert.alert(`Call ${item.name}?`, item.number, [
      { text: 'Cancel', style: 'cancel' },
      { text: '📞  Call Now', onPress: () => Linking.openURL(`tel:${item.number}`) },
    ]);
  };

  return (
    <View style={s.helpCard}>
      <View style={s.helpInfo}>
        <Text style={s.helpName}>{item.name}</Text>
        <Text style={s.helpDesc}>{item.desc}</Text>
        <Text style={s.helpAvail}>🕐  {item.available}</Text>
      </View>
      <TouchableOpacity style={s.callBtn} onPress={call} activeOpacity={0.85}>
        <Text style={s.callNumber}>{item.number}</Text>
        <Text style={s.callLabel}>📞  Call</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CrisisSupportScreen({ navigation }) {
  const [expandedCat, setExpandedCat] = useState(null);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#B83228" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.decor} />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>💙  Crisis Support</Text>
          <Text style={s.headerSub}>You are not alone. Help is available right now.</Text>
        </View>

        {/* You're not alone card */}
        <View style={s.body}>
          <View style={s.reassureCard}>
            <Text style={s.reassureIcon}>🤝</Text>
            <Text style={s.reassureTitle}>It's okay to ask for help</Text>
            <Text style={s.reassureTxt}>
              Reaching out is a sign of strength, not weakness. These helplines are free, confidential, and staffed by trained professionals who care.
            </Text>
          </View>

          {/* Helplines */}
          {HELPLINES.map((cat, ci) => (
            <View key={ci} style={s.category}>
              <TouchableOpacity
                style={s.catHeader}
                onPress={() => setExpandedCat(expandedCat === ci ? null : ci)}
                activeOpacity={0.85}
              >
                <Text style={s.catTitle}>{cat.category}</Text>
                <Text style={[s.catToggle, { color: C.primary }]}>{expandedCat === ci ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {(expandedCat === ci || ci === 0) && cat.items.map((item, ii) => (
                <HelplineCard key={ii} item={item} />
              ))}
            </View>
          ))}

          {/* Self-care tips */}
          <View style={s.selfCareCard}>
            <Text style={s.selfCareTitle}>🌱  Right Now — Try These</Text>
            <Text style={s.selfCareSub}>Simple grounding techniques you can do immediately</Text>
            {SELF_CARE.map((item, i) => (
              <View key={i} style={s.selfCareItem}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={s.selfCareTxt}>{item.tip}</Text>
              </View>
            ))}
          </View>

          {/* Remind banner */}
          <View style={s.remindCard}>
            <Text style={s.remindTxt}>
              💙  If you are in immediate danger, call{' '}
              <Text style={s.remindNumber} onPress={() => Linking.openURL('tel:112')}>112</Text>
              {' '}right now.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { backgroundColor: C.accentRed, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.1)' },
  backBtn:        { marginBottom: 10 },
  backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:      { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19 },
  body:           { padding: 16 },
  reassureCard:   { backgroundColor: C.card, borderRadius: 18, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  reassureIcon:   { fontSize: 36, marginBottom: 10 },
  reassureTitle:  { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 },
  reassureTxt:    { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 21 },
  category:       { marginBottom: 14 },
  catHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  catTitle:       { fontSize: 14, fontWeight: '700', color: C.text },
  catToggle:      { fontSize: 13, fontWeight: '700' },
  helpCard:       { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  helpInfo:       { flex: 1 },
  helpName:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 2 },
  helpDesc:       { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 17 },
  helpAvail:      { fontSize: 11, color: C.textLight, fontWeight: '500' },
  callBtn:        { backgroundColor: '#FFF0EE', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFD0CA', minWidth: 80 },
  callNumber:     { fontSize: 11, fontWeight: '700', color: C.accentRed, marginBottom: 3 },
  callLabel:      { fontSize: 12, fontWeight: '700', color: C.accentRed },
  selfCareCard:   { backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  selfCareTitle:  { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  selfCareSub:    { fontSize: 12, color: C.textMid, marginBottom: 14 },
  selfCareItem:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  selfCareTxt:    { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 20 },
  remindCard:     { backgroundColor: '#FFF0EE', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FFD0CA' },
  remindTxt:      { fontSize: 14, color: C.accentRed, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  remindNumber:   { fontWeight: '800', textDecorationLine: 'underline' },
});