// // src/screens/HomeScreen.js
// import React, { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   StatusBar, RefreshControl,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { C, getWellnessColor, getWellnessLabel } from '../theme';

// const MOOD_KEY = 'moodHistory';

// const FEATURES = [
//   { screen: 'TextAnalysis',       label: 'Text',       sub: 'Type your feelings',  color: C.primary,     },
//   { screen: 'AudioAnalysis',      label: 'Voice',      sub: 'Speak naturally',     color: '#5BB8F5',     },
//   { screen: 'VideoAnalysis',      label: 'Facial',     sub: 'Express visually',    color: C.accentGreen, },
//   { screen: 'MultimodalAnalysis', label: 'Multimodal', sub: 'All inputs combined', color: C.purple,      },
// ];

// export default function HomeScreen({ navigation }) {
//   const [todayScore, setTodayScore] = useState(null);
//   const [recentEntries, setRecent]  = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadData = async () => {
//     try {
//       const raw     = await AsyncStorage.getItem(MOOD_KEY);
//       const entries = raw ? JSON.parse(raw) : [];
//       setRecent(entries.slice(0, 3));

//       const today = entries.filter(e =>
//         new Date(e.timestamp).toDateString() === new Date().toDateString()
//       );
//       if (today.length > 0) {
//         const avg = today.reduce((s, e) => s + (e.wellnessScore || 5), 0) / today.length;
//         setTodayScore(Math.round(avg * 10) / 10);
//       } else {
//         setTodayScore(null);
//       }
//     } catch (e) { console.error('loadData error:', e); }
//   };

//   useFocusEffect(useCallback(() => { loadData(); }, []));

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good Morning';
//     if (h < 17) return 'Good Afternoon';
//     return 'Good Evening';
//   };

//   const scoreColor = todayScore !== null ? getWellnessColor(todayScore) : 'rgba(255,255,255,0.5)';
//   const scoreLabel = todayScore !== null ? getWellnessLabel(todayScore) : 'No check-in yet';

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView
//         style={s.scroll}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
//         }
//       >

//         {/* ── Hero ── */}
//         <View style={s.hero}>
//           <View style={s.heroDecor1} />
//           <View style={s.heroDecor2} />

//           {/* Greeting row + Reminder button */}
//           <View style={s.heroTopRow}>
//             <View>
//               <Text style={s.greeting}>{greeting()}</Text>
//               <Text style={s.heroTitle}>How are you feeling today?</Text>
//             </View>
//             <TouchableOpacity
//               style={s.settingsBtn}
//               onPress={() => navigation.navigate('Settings')}
//               activeOpacity={0.85}
//             >
//               <Text style={s.settingsIcon}>⚙</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Wellness card */}
//           <View style={s.wellnessCard}>
//             <View style={s.wellnessLeft}>
//               <Text style={s.wellnessLabel}>Today's Wellness</Text>
//               <View style={s.wellnessScoreRow}>
//                 <Text style={s.wellnessScore}>
//                   {todayScore !== null ? todayScore.toFixed(1) : '—'}
//                 </Text>
//                 <Text style={s.wellnessMax}>/10</Text>
//               </View>
//               <View style={s.wellnessBar}>
//                 <View style={[s.wellnessFill, {
//                   width: todayScore !== null ? `${(todayScore / 10) * 100}%` : '0%',
//                 }]} />
//               </View>
//             </View>
//             <View style={s.wellnessRight}>
//               <View style={[s.wellnessCircle, { borderColor: scoreColor }]}>
//                 <Text style={s.wellnessCircleScore}>
//                   {todayScore !== null ? todayScore.toFixed(0) : '—'}
//                 </Text>
//               </View>
//               <Text style={s.wellnessSubLabel}>{scoreLabel}</Text>
//             </View>
//           </View>
//         </View>
//         {/* ── End Hero ── */}

//         {/* ── All Cards ── */}
//         <View style={s.section}>
//           <Text style={s.sectionTitle}>Analyse Your Emotions</Text>
//           <View style={s.cardGrid}>

//             {FEATURES.map(f => (
//               <TouchableOpacity
//                 key={f.screen}
//                 style={[s.card, s.cardBright, { borderTopColor: f.color }]}
//                 onPress={() => navigation.navigate(f.screen)}
//                 activeOpacity={0.85}
//               >
//                 <Text style={[s.cardLabel, { color: f.color }]}>{f.label}</Text>
//                 <Text style={s.cardSub}>{f.sub}</Text>
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               style={[s.card, s.cardDull, { borderTopColor: C.primary }]}
//               onPress={() => navigation.navigate('MoodTracking')}
//               activeOpacity={0.85}
//             >
//               <Text style={[s.cardLabel, { color: C.primary }]}>Mood History</Text>
//               <Text style={s.cardSub}>7-day trends</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[s.card, s.cardDull, { borderTopColor: C.accentRed }]}
//               onPress={() => navigation.navigate('Helpline')}
//               activeOpacity={0.85}
//             >
//               <Text style={[s.cardLabel, { color: C.accentRed }]}>Crisis Help</Text>
//               <Text style={s.cardSub}>Helplines</Text>
//             </TouchableOpacity>

//           </View>
//         </View>

//         {/* ── Recent Entries ── */}
//         {recentEntries.length > 0 && (
//           <View style={s.section}>
//             <View style={s.sectionRow}>
//               <Text style={s.sectionTitle}>Recent</Text>
//               <TouchableOpacity onPress={() => navigation.navigate('MoodTracking')}>
//                 <Text style={s.seeAll}>See All</Text>
//               </TouchableOpacity>
//             </View>
//             {recentEntries.map((entry, i) => {
//               const wc = getWellnessColor(entry.wellnessScore || 5);
//               return (
//                 <View key={i} style={s.recentCard}>
//                   <View style={[s.recentDot, { backgroundColor: wc }]} />
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.recentEmotion}>
//                       {entry.emotion
//                         ? entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)
//                         : 'Unknown'}
//                     </Text>
//                     <Text style={s.recentMeta}>
//                       {entry.modality
//                         ? entry.modality.charAt(0).toUpperCase() + entry.modality.slice(1)
//                         : 'Analysis'}
//                       {' · '}
//                       {entry.timestamp
//                         ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                         : ''}
//                     </Text>
//                   </View>
//                   <Text style={[s.recentScore, { color: wc }]}>
//                     {(entry.wellnessScore || 5).toFixed(1)}
//                   </Text>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {recentEntries.length === 0 && (
//           <View style={s.emptyCard}>
//             <View style={s.emptyDot} />
//             <Text style={s.emptyTitle}>Start Your Journey</Text>
//             <Text style={s.emptySub}>
//               Do your first analysis above to begin tracking your emotional wellness.
//             </Text>
//           </View>
//         )}

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:                { flex: 1, backgroundColor: C.bg },
//   scroll:              { flex: 1 },

//   // Hero
//   hero:                { backgroundColor: C.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   heroDecor1:          { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
//   heroDecor2:          { position: 'absolute', bottom: -20, left: -10, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' },
//   heroTopRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
//   greeting:            { color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: '700', marginBottom: 6 },
//   heroTitle:           { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '400' },

//   settingsBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
//   settingsIcon:        { fontSize: 18, color: '#fff' },

//   // Wellness card
//   wellnessCard:        { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
//   wellnessLeft:        { flex: 1, paddingRight: 16 },
//   wellnessLabel:       { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginBottom: 6 },
//   wellnessScoreRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 },
//   wellnessScore:       { color: '#fff', fontSize: 32, fontWeight: '700' },
//   wellnessMax:         { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
//   wellnessBar:         { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
//   wellnessFill:        { height: '100%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' },
//   wellnessRight:       { alignItems: 'center', gap: 6 },
//   wellnessCircle:      { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
//   wellnessCircleScore: { color: '#fff', fontSize: 18, fontWeight: '700' },
//   wellnessSubLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', textAlign: 'center', maxWidth: 70 },

//   // Cards
//   section:             { paddingHorizontal: 16, paddingTop: 20 },
//   sectionRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   sectionTitle:        { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
//   seeAll:              { fontSize: 13, color: C.primary, fontWeight: '600' },
//   cardGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//   card:                { width: '47.5%', borderRadius: 16, padding: 14, borderTopWidth: 4, borderWidth: 1, borderColor: C.border },
//   cardBright:          { backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
//   cardDull:            { backgroundColor: '#F4F8FD', elevation: 0 },
//   cardLabel:           { fontSize: 14, fontWeight: '700', marginBottom: 4 },
//   cardSub:             { fontSize: 11, color: C.textLight },

//   // Recent
//   recentCard:          { backgroundColor: C.card, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 12 },
//   recentDot:           { width: 12, height: 12, borderRadius: 6 },
//   recentEmotion:       { fontSize: 13, fontWeight: '700', color: C.text },
//   recentMeta:          { fontSize: 11, color: C.textLight, marginTop: 2 },
//   recentScore:         { fontSize: 16, fontWeight: '700' },

//   // Empty
//   emptyCard:           { margin: 16, backgroundColor: C.card, borderRadius: 18, padding: 28, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
//   emptyDot:            { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryLight },
//   emptyTitle:          { fontSize: 16, fontWeight: '700', color: C.text },
//   emptySub:            { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20 },
// });

// // src/screens/HomeScreen.js
// import React, { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   StatusBar, RefreshControl,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { C, getWellnessColor, getWellnessLabel } from '../theme';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// const MOOD_KEY = 'moodHistory';

// const FEATURES = [
//   { screen: 'TextAnalysis',       label: 'Text',       sub: 'Type your feelings',  color: C.primary,     },
//   { screen: 'AudioAnalysis',      label: 'Voice',      sub: 'Speak naturally',     color: '#5BB8F5',     },
//   { screen: 'VideoAnalysis',      label: 'Facial',     sub: 'Express visually',    color: C.accentGreen, },
//   { screen: 'MultimodalAnalysis', label: 'Multimodal', sub: 'All inputs combined', color: C.purple,      },
// ];

// export default function HomeScreen({ navigation }) {
//   const [todayScore, setTodayScore] = useState(null);
//   const [recentEntries, setRecent]  = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadData = async () => {
//     try {
//       const raw     = await AsyncStorage.getItem(MOOD_KEY);
//       const entries = raw ? JSON.parse(raw) : [];
//       setRecent(entries.slice(0, 3));

//       const today = entries.filter(e =>
//         new Date(e.timestamp).toDateString() === new Date().toDateString()
//       );
//       if (today.length > 0) {
//         const avg = today.reduce((s, e) => s + (e.wellnessScore || 5), 0) / today.length;
//         setTodayScore(Math.round(avg * 10) / 10);
//       } else {
//         setTodayScore(null);
//       }
//     } catch (e) { console.error('loadData error:', e); }
//   };

//   useFocusEffect(useCallback(() => { loadData(); }, []));

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good Morning';
//     if (h < 17) return 'Good Afternoon';
//     return 'Good Evening';
//   };

//   const scoreColor = todayScore !== null ? getWellnessColor(todayScore) : 'rgba(255,255,255,0.5)';
//   const scoreLabel = todayScore !== null ? getWellnessLabel(todayScore) : 'No check-in yet';

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView
//         style={s.scroll}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
//         }
//       >

//         {/* ── Hero ── */}
//         <View style={s.hero}>
//           <View style={s.heroDecor1} />
//           <View style={s.heroDecor2} />

//           {/* Greeting row + Reminder button */}
//           <View style={s.heroTopRow}>
//             <View>
//               <Text style={s.greeting}>{greeting()}</Text>
//               <Text style={s.heroTitle}>How are you feeling today?</Text>
//             </View>
//             <TouchableOpacity
//               style={s.settingsBtn}
//               onPress={() => navigation.navigate('Settings')}
//               activeOpacity={0.85}
//             >
//               <Icon name="cog-outline" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>

//           {/* Wellness card */}
//           <View style={s.wellnessCard}>
//             <View style={s.wellnessLeft}>
//               <Text style={s.wellnessLabel}>Today's Wellness</Text>
//               <View style={s.wellnessScoreRow}>
//                 <Text style={s.wellnessScore}>
//                   {todayScore !== null ? todayScore.toFixed(1) : '—'}
//                 </Text>
//                 <Text style={s.wellnessMax}>/10</Text>
//               </View>
//               <View style={s.wellnessBar}>
//                 <View style={[s.wellnessFill, {
//                   width: todayScore !== null ? `${(todayScore / 10) * 100}%` : '0%',
//                 }]} />
//               </View>
//             </View>
//             <View style={s.wellnessRight}>
//               <View style={[s.wellnessCircle, { borderColor: scoreColor }]}>
//                 <Text style={s.wellnessCircleScore}>
//                   {todayScore !== null ? todayScore.toFixed(0) : '—'}
//                 </Text>
//               </View>
//               <Text style={s.wellnessSubLabel}>{scoreLabel}</Text>
//             </View>
//           </View>
//         </View>
//         {/* ── End Hero ── */}

//         {/* ── All Cards ── */}
//         <View style={s.section}>
//           <Text style={s.sectionTitle}>Analyse Your Emotions</Text>
//           <View style={s.cardGrid}>

//             {FEATURES.map(f => (
//               <TouchableOpacity
//                 key={f.screen}
//                 style={[s.card, s.cardBright, { borderTopColor: f.color }]}
//                 onPress={() => navigation.navigate(f.screen)}
//                 activeOpacity={0.85}
//               >
//                 <Text style={[s.cardLabel, { color: f.color }]}>{f.label}</Text>
//                 <Text style={s.cardSub}>{f.sub}</Text>
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               style={[s.card, s.cardDull, { borderTopColor: C.primary }]}
//               onPress={() => navigation.navigate('MoodTracking')}
//               activeOpacity={0.85}
//             >
//               <Text style={[s.cardLabel, { color: C.primary }]}>Mood History</Text>
//               <Text style={s.cardSub}>7-day trends</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[s.card, s.cardDull, { borderTopColor: C.accentRed }]}
//               onPress={() => navigation.navigate('Helpline')}
//               activeOpacity={0.85}
//             >
//               <Text style={[s.cardLabel, { color: C.accentRed }]}>Crisis Help</Text>
//               <Text style={s.cardSub}>Helplines</Text>
//             </TouchableOpacity>

//           </View>
//         </View>

//         {/* ── Recent Entries ── */}
//         {recentEntries.length > 0 && (
//           <View style={s.section}>
//             <View style={s.sectionRow}>
//               <Text style={s.sectionTitle}>Recent</Text>
//               <TouchableOpacity onPress={() => navigation.navigate('MoodTracking')}>
//                 <Text style={s.seeAll}>See All</Text>
//               </TouchableOpacity>
//             </View>
//             {recentEntries.map((entry, i) => {
//               const wc = getWellnessColor(entry.wellnessScore || 5);
//               return (
//                 <View key={i} style={s.recentCard}>
//                   <View style={[s.recentDot, { backgroundColor: wc }]} />
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.recentEmotion}>
//                       {entry.emotion
//                         ? entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)
//                         : 'Unknown'}
//                     </Text>
//                     <Text style={s.recentMeta}>
//                       {entry.modality
//                         ? entry.modality.charAt(0).toUpperCase() + entry.modality.slice(1)
//                         : 'Analysis'}
//                       {' · '}
//                       {entry.timestamp
//                         ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                         : ''}
//                     </Text>
//                   </View>
//                   <Text style={[s.recentScore, { color: wc }]}>
//                     {(entry.wellnessScore || 5).toFixed(1)}
//                   </Text>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {recentEntries.length === 0 && (
//           <View style={s.emptyCard}>
//             <View style={s.emptyDot} />
//             <Text style={s.emptyTitle}>Start Your Journey</Text>
//             <Text style={s.emptySub}>
//               Do your first analysis above to begin tracking your emotional wellness.
//             </Text>
//           </View>
//         )}

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:                { flex: 1, backgroundColor: C.bg },
//   scroll:              { flex: 1 },

//   // Hero
//   hero:                { backgroundColor: C.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   heroDecor1:          { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
//   heroDecor2:          { position: 'absolute', bottom: -20, left: -10, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' },
//   heroTopRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
//   greeting:            { color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: '700', marginBottom: 6 },
//   heroTitle:           { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '400' },

//   settingsBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginTop: 4 },

//   // Wellness card
//   wellnessCard:        { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
//   wellnessLeft:        { flex: 1, paddingRight: 16 },
//   wellnessLabel:       { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginBottom: 6 },
//   wellnessScoreRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 },
//   wellnessScore:       { color: '#fff', fontSize: 32, fontWeight: '700' },
//   wellnessMax:         { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
//   wellnessBar:         { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
//   wellnessFill:        { height: '100%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' },
//   wellnessRight:       { alignItems: 'center', gap: 6 },
//   wellnessCircle:      { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
//   wellnessCircleScore: { color: '#fff', fontSize: 18, fontWeight: '700' },
//   wellnessSubLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', textAlign: 'center', maxWidth: 70 },

//   // Cards
//   section:             { paddingHorizontal: 16, paddingTop: 20 },
//   sectionRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   sectionTitle:        { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
//   seeAll:              { fontSize: 13, color: C.primary, fontWeight: '600' },
//   cardGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//   card:                { width: '47.5%', borderRadius: 16, padding: 14, borderTopWidth: 4, borderWidth: 1, borderColor: C.border },
//   cardBright:          { backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
//   cardDull:            { backgroundColor: '#F4F8FD', elevation: 0 },
//   cardLabel:           { fontSize: 14, fontWeight: '700', marginBottom: 4 },
//   cardSub:             { fontSize: 11, color: C.textLight },

//   // Recent
//   recentCard:          { backgroundColor: C.card, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 12 },
//   recentDot:           { width: 12, height: 12, borderRadius: 6 },
//   recentEmotion:       { fontSize: 13, fontWeight: '700', color: C.text },
//   recentMeta:          { fontSize: 11, color: C.textLight, marginTop: 2 },
//   recentScore:         { fontSize: 16, fontWeight: '700' },

//   // Empty
//   emptyCard:           { margin: 16, backgroundColor: C.card, borderRadius: 18, padding: 28, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
//   emptyDot:            { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryLight },
//   emptyTitle:          { fontSize: 16, fontWeight: '700', color: C.text },
//   emptySub:            { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20 },
// });

// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { C, getWellnessColor, getWellnessLabel } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const MOOD_KEY = 'moodHistory';

const FEATURES = [
  { screen: 'TextAnalysis',       label: 'Text',       sub: 'Type your feelings',  color: C.primary,     },
  { screen: 'AudioAnalysis',      label: 'Voice',      sub: 'Speak naturally',     color: '#5BB8F5',     },
  { screen: 'VideoAnalysis',      label: 'Facial',     sub: 'Express visually',    color: C.accentGreen, },
  { screen: 'MultimodalAnalysis', label: 'Multimodal', sub: 'All inputs combined', color: C.purple,      },
];

export default function HomeScreen({ navigation }) {
  const [todayScore, setTodayScore] = useState(null);
  const [recentEntries, setRecent]  = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const raw     = await AsyncStorage.getItem(MOOD_KEY);
      const entries = raw ? JSON.parse(raw) : [];
      setRecent(entries.slice(0, 3));

      const today = entries.filter(e =>
        new Date(e.timestamp).toDateString() === new Date().toDateString()
      );
      if (today.length > 0) {
        const avg = today.reduce((s, e) => s + (e.wellnessScore || 5), 0) / today.length;
        setTodayScore(Math.round(avg * 10) / 10);
      } else {
        setTodayScore(null);
      }
    } catch (e) { console.error('loadData error:', e); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const scoreColor = todayScore !== null ? getWellnessColor(todayScore) : 'rgba(255,255,255,0.5)';
  const scoreLabel = todayScore !== null ? getWellnessLabel(todayScore) : 'No check-in yet';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
        }
      >

        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.heroDecor1} />
          <View style={s.heroDecor2} />

          {/* Greeting row + Reminder button */}
          <View style={s.heroTopRow}>
            <View>
              <Text style={s.greeting}>{greeting()}</Text>
              <Text style={s.heroTitle}>How are you feeling today?</Text>
            </View>
            <TouchableOpacity
              style={s.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.85}
            >
              <Icon name="cog-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Wellness card */}
          <View style={s.wellnessCard}>
            <View style={s.wellnessLeft}>
              <Text style={s.wellnessLabel}>Today's Wellness</Text>
              <View style={s.wellnessScoreRow}>
                <Text style={s.wellnessScore}>
                  {todayScore !== null ? todayScore.toFixed(1) : '—'}
                </Text>
                <Text style={s.wellnessMax}>/10</Text>
              </View>
              <View style={s.wellnessBar}>
                <View style={[s.wellnessFill, {
                  width: todayScore !== null ? `${(todayScore / 10) * 100}%` : '0%',
                }]} />
              </View>
            </View>
            <View style={s.wellnessRight}>
              <View style={[s.wellnessCircle, { borderColor: scoreColor }]}>
                <Text style={s.wellnessCircleScore}>
                  {todayScore !== null ? todayScore.toFixed(0) : '—'}
                </Text>
              </View>
              <Text style={s.wellnessSubLabel}>{scoreLabel}</Text>
            </View>
          </View>
        </View>
        {/* ── End Hero ── */}

        {/* ── All Cards ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Analyse Your Emotions</Text>
          <View style={s.cardGrid}>

            {FEATURES.map(f => (
              <TouchableOpacity
                key={f.screen}
                style={[s.card, s.cardBright, { borderTopColor: f.color }]}
                onPress={() => navigation.navigate(f.screen)}
                activeOpacity={0.85}
              >
                <Text style={[s.cardLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={s.cardSub}>{f.sub}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[s.card, s.cardDull, { borderTopColor: C.primary }]}
              onPress={() => navigation.navigate('MoodTracking')}
              activeOpacity={0.85}
            >
              <Text style={[s.cardLabel, { color: C.primary }]}>Mood History</Text>
              <Text style={s.cardSub}>7-day trends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.card, s.cardDull, { borderTopColor: C.accentRed }]}
              onPress={() => navigation.navigate('Helpline')}
              activeOpacity={0.85}
            >
              <Text style={[s.cardLabel, { color: C.accentRed }]}>Crisis Help</Text>
              <Text style={s.cardSub}>Helplines</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* ── Recent Entries ── */}
        {recentEntries.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Recent</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MoodTracking')}>
                <Text style={s.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentEntries.map((entry, i) => {
              const wc = getWellnessColor(entry.wellnessScore || 5);
              return (
                <View key={i} style={s.recentCard}>
                  <View style={[s.recentDot, { backgroundColor: wc }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.recentEmotion}>
                      {entry.emotion
                        ? entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)
                        : 'Unknown'}
                    </Text>
                    <Text style={s.recentMeta}>
                      {entry.modality
                        ? entry.modality.charAt(0).toUpperCase() + entry.modality.slice(1)
                        : 'Analysis'}
                      {' · '}
                      {entry.timestamp
                        ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </Text>
                  </View>
                  <Text style={[s.recentScore, { color: wc }]}>
                    {(entry.wellnessScore || 5).toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {recentEntries.length === 0 && (
          <View style={s.emptyCard}>
            <View style={s.emptyDot} />
            <Text style={s.emptyTitle}>Start Your Journey</Text>
            <Text style={s.emptySub}>
              Do your first analysis above to begin tracking your emotional wellness.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:                { flex: 1, backgroundColor: C.bg },
  scroll:              { flex: 1 },

  // Hero
  hero:                { backgroundColor: C.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  heroDecor1:          { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroDecor2:          { position: 'absolute', bottom: -20, left: -10, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroTopRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  greeting:            { color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  heroTitle:           { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '400' },

  settingsBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginTop: 4 },

  // Wellness card
  wellnessCard:        { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  wellnessLeft:        { flex: 1, paddingRight: 16 },
  wellnessLabel:       { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  wellnessScoreRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 },
  wellnessScore:       { color: '#fff', fontSize: 32, fontWeight: '700' },
  wellnessMax:         { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  wellnessBar:         { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  wellnessFill:        { height: '100%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' },
  wellnessRight:       { alignItems: 'center', gap: 6 },
  wellnessCircle:      { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  wellnessCircleScore: { color: '#fff', fontSize: 18, fontWeight: '700' },
  wellnessSubLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', textAlign: 'center', maxWidth: 70 },

  // Cards
  section:             { paddingHorizontal: 16, paddingTop: 20 },
  sectionRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:        { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  seeAll:              { fontSize: 13, color: C.primary, fontWeight: '600' },
  cardGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card:                { width: '47.5%', borderRadius: 16, padding: 14, borderTopWidth: 4, borderWidth: 1, borderColor: C.border },
  cardBright:          { backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  cardDull:            { backgroundColor: '#F4F8FD', elevation: 0 },
  cardLabel:           { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardSub:             { fontSize: 11, color: C.textLight },

  // Recent
  recentCard:          { backgroundColor: C.card, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 12 },
  recentDot:           { width: 12, height: 12, borderRadius: 6 },
  recentEmotion:       { fontSize: 13, fontWeight: '700', color: C.text },
  recentMeta:          { fontSize: 11, color: C.textLight, marginTop: 2 },
  recentScore:         { fontSize: 16, fontWeight: '700' },

  // Empty
  emptyCard:           { margin: 16, backgroundColor: C.card, borderRadius: 18, padding: 28, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  emptyDot:            { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.primary },
  emptyTitle:          { fontSize: 16, fontWeight: '700', color: C.text },
  emptySub:            { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20 },
});