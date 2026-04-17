// // // src/screens/HelplineScreen.js - STANDALONE HELPLINE PAGE
// // import React, { useState } from 'react';
// // import {
// //   View, Text, StyleSheet, ScrollView,
// //   TouchableOpacity, Linking, Alert
// // } from 'react-native';

// // const ORGANIZATIONS = [
// //   {
// //     id: 1, name: 'iCall', tagline: 'TISS Professional Counselling',
// //     number: '9152987821', display: '9152987821', altNumber: null,
// //     website: 'https://icallhelpline.org', hours: 'Mon–Sat, 8 AM – 10 PM',
// //     languages: ['English', 'Hindi', 'Marathi'], color: '#4CAF50', emoji: '🟢',
// //   },
// //   {
// //     id: 2, name: 'Tele MANAS', tagline: 'Govt. of India National Helpline',
// //     number: '14416', display: '14416', altNumber: '1800-891-4416',
// //     website: 'https://telemanas.mohfw.gov.in', hours: '24/7',
// //     languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
// //       'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Urdu', '+ more'],
// //     color: '#2196F3', emoji: '🔵',
// //   },
// //   {
// //     id: 3, name: 'Vandrevala Foundation', tagline: '24/7 Mental Health Helpline',
// //     number: '9999666555', display: '9999 666 555', altNumber: '1860-2662-345',
// //     website: 'https://www.vandrevalafoundation.com', hours: '24/7',
// //     languages: ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil',
// //       'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'],
// //     color: '#9C27B0', emoji: '🟣',
// //   },
// //   {
// //     id: 4, name: 'AASRA', tagline: 'Suicide Prevention & Crisis Support',
// //     number: '9820466627', display: '9820466627', altNumber: '022-27546669',
// //     website: 'http://www.aasra.info', hours: '24/7',
// //     languages: ['English', 'Hindi'], color: '#FF5722', emoji: '🔴',
// //   },
// //   {
// //     id: 5, name: 'Fortis Mental Health', tagline: 'Fortis Healthcare Helpline',
// //     number: '8376804102', display: '8376804102', altNumber: null,
// //     website: 'https://www.fortishealthcare.com', hours: '24/7',
// //     languages: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu',
// //       'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi',
// //       'Odia', 'Assamese', 'Urdu', 'Rajasthani', 'Bhojpuri'],
// //     color: '#00BCD4', emoji: '🏥',
// //   },
// //   {
// //     id: 6, name: '1Life', tagline: 'Suicide Prevention & Crisis Support',
// //     number: '7893078930', display: '78930 78930', altNumber: null,
// //     website: 'https://www.1life.org.in', hours: '24/7',
// //     languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
// //       'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu'],
// //     color: '#FF9800', emoji: '🟠',
// //   },
// //   {
// //     id: 7, name: 'Arpita Foundation', tagline: 'Mental Health & Counselling (Bangalore)',
// //     number: '08023655557', display: '080-23655557', altNumber: '08023655556',
// //     website: 'https://www.arpitafoundation.org', hours: 'Mon–Sat, 9 AM – 7 PM',
// //     languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
// //       'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu'],
// //     color: '#E91E63', emoji: '🩷',
// //   },
// //   {
// //     id: 8, name: 'Mann Talks', tagline: 'Mental Health Awareness & Support',
// //     number: '8686139139', display: '8686139139', altNumber: null,
// //     website: 'https://www.manntalks.org', hours: 'Mon–Sat, 10 AM – 6 PM',
// //     languages: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali'],
// //     color: '#607D8B', emoji: '💙',
// //   },
// // ];

// // function OrgCard({ org }) {
// //   const [expanded, setExpanded] = useState(false);

// //   const call = (num) => {
// //     const cleaned = num.replace(/[^0-9]/g, '');
// //     Linking.openURL(`tel:${cleaned}`).catch(() =>
// //       Alert.alert('Error', 'Could not open dialer.')
// //     );
// //   };

// //   const openWeb = (url) => {
// //     Linking.openURL(url).catch(() =>
// //       Alert.alert('Error', 'Could not open website.')
// //     );
// //   };

// //   return (
// //     <View style={[styles.card, { borderLeftColor: org.color }]}>
// //       <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)}>
// //         <View style={styles.cardTitleRow}>
// //           <Text style={styles.cardEmoji}>{org.emoji}</Text>
// //           <View style={styles.cardTitleText}>
// //             <Text style={styles.cardName}>{org.name}</Text>
// //             <Text style={styles.cardTagline}>{org.tagline}</Text>
// //           </View>
// //           <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
// //         </View>
// //       </TouchableOpacity>

// //       <TouchableOpacity
// //         style={[styles.callBtn, { backgroundColor: org.color }]}
// //         onPress={() => call(org.number)}
// //       >
// //         <Text style={styles.callBtnText}>📞 {org.display}</Text>
// //       </TouchableOpacity>

// //       {expanded && (
// //         <View style={styles.cardDetail}>
// //           {org.altNumber && (
// //             <TouchableOpacity style={styles.altCallBtn} onPress={() => call(org.altNumber)}>
// //               <Text style={styles.altCallText}>📞 Alt: {org.altNumber}</Text>
// //             </TouchableOpacity>
// //           )}
// //           <View style={styles.detailRow}>
// //             <Text style={styles.detailIcon}>🕐</Text>
// //             <Text style={styles.detailText}>{org.hours}</Text>
// //           </View>
// //           <View style={styles.detailRow}>
// //             <Text style={styles.detailIcon}>🗣️</Text>
// //             <Text style={styles.detailText}>{org.languages.join(' • ')}</Text>
// //           </View>
// //           <TouchableOpacity style={styles.webBtn} onPress={() => openWeb(org.website)}>
// //             <Text style={styles.webBtnText}>
// //               🌐 {org.website.replace('https://', '').replace('http://', '')}
// //             </Text>
// //           </TouchableOpacity>
// //         </View>
// //       )}
// //     </View>
// //   );
// // }

// // export default function HelplineScreen({ navigation }) {
// //   const callEmergency = () => {
// //     Linking.openURL('tel:112').catch(() =>
// //       Alert.alert('Error', 'Could not open dialer.')
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //           <Text style={styles.backButtonText}>← Back</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>Mental Health Helplines</Text>
// //         <Text style={styles.headerSubtitle}>
// //           Confidential support — available anytime
// //         </Text>
// //       </View>

// //       <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

// //         {/* Emergency */}
// //         <TouchableOpacity style={styles.emergencyBanner} onPress={callEmergency}>
// //           <Text style={styles.emergencyText}>🚨 Life-threatening emergency? Call 112</Text>
// //           <Text style={styles.emergencySubText}>Ambulance: 102</Text>
// //         </TouchableOpacity>

// //         <Text style={styles.sectionLabel}>
// //           Tap any card to expand details. Tap the number to call directly.
// //         </Text>

// //         {ORGANIZATIONS.map(org => <OrgCard key={org.id} org={org} />)}

// //         {/* Bottom Note */}
// //         <View style={styles.bottomNote}>
// //           <Text style={styles.bottomNoteText}>
// //             💬 All calls are confidential. Reaching out is a sign of strength.
// //           </Text>
// //         </View>

// //         {/* Tip */}
// //         <View style={styles.tipBox}>
// //           <Text style={styles.tipTitle}>💡 Tips</Text>
// //           <Text style={styles.tipText}>• Call during listed hours for best availability</Text>
// //           <Text style={styles.tipText}>• Tele MANAS & Vandrevala are available 24/7</Text>
// //           <Text style={styles.tipText}>• For emergencies, always call 112 first</Text>
// //         </View>

// //         <View style={{ height: 40 }} />
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F8F9FA' },

// //   header: {
// //     backgroundColor: '#6C63FF',
// //     paddingHorizontal: 20,
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //   },
// //   backButton: { marginBottom: 10 },
// //   backButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
// //   headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
// //   headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

// //   body: { flex: 1, paddingHorizontal: 15 },

// //   emergencyBanner: {
// //     backgroundColor: '#D32F2F', borderRadius: 14, padding: 16,
// //     alignItems: 'center', marginTop: 15, marginBottom: 10, elevation: 3,
// //   },
// //   emergencyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
// //   emergencySubText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3 },

// //   sectionLabel: {
// //     fontSize: 13, color: '#888', textAlign: 'center',
// //     marginBottom: 12, marginTop: 4,
// //   },

// //   card: {
// //     backgroundColor: 'white', borderRadius: 14, marginBottom: 12,
// //     borderLeftWidth: 5, elevation: 2, overflow: 'hidden',
// //   },
// //   cardHeader: { padding: 14 },
// //   cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
// //   cardEmoji: { fontSize: 22, marginRight: 10 },
// //   cardTitleText: { flex: 1 },
// //   cardName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
// //   cardTagline: { fontSize: 12, color: '#777', marginTop: 1 },
// //   expandIcon: { fontSize: 12, color: '#999', paddingLeft: 8 },

// //   callBtn: {
// //     marginHorizontal: 14, marginBottom: 14,
// //     padding: 11, borderRadius: 10, alignItems: 'center',
// //   },
// //   callBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

// //   cardDetail: {
// //     paddingHorizontal: 14, paddingBottom: 14,
// //     borderTopWidth: 1, borderTopColor: '#F0F0F0',
// //   },
// //   altCallBtn: {
// //     marginTop: 10, padding: 9, borderRadius: 8,
// //     backgroundColor: '#F5F5F5', alignItems: 'center', marginBottom: 8,
// //   },
// //   altCallText: { fontSize: 14, color: '#444', fontWeight: '600' },
// //   detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 7 },
// //   detailIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
// //   detailText: { fontSize: 13, color: '#555', flex: 1, lineHeight: 18 },
// //   webBtn: {
// //     marginTop: 10, padding: 9, borderRadius: 8,
// //     backgroundColor: '#E8F5E9', alignItems: 'center',
// //   },
// //   webBtnText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },

// //   bottomNote: {
// //     backgroundColor: '#E8EAF6', borderRadius: 12,
// //     padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 10,
// //   },
// //   bottomNoteText: { fontSize: 13, color: '#3949AB', fontWeight: '600', textAlign: 'center' },

// //   tipBox: {
// //     backgroundColor: 'white', borderRadius: 12, padding: 15,
// //     elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6C63FF',
// //   },
// //   tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   tipText: { fontSize: 13, color: '#666', marginBottom: 3 },
// // });

// // src/screens/HelplineScreen.js
// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView,
//   TouchableOpacity, Linking, Alert, StatusBar,
// } from 'react-native';
// import { C } from '../theme';

// const ORGANIZATIONS = [
//   {
//     id: 1, name: 'iCall', tagline: 'TISS Professional Counselling',
//     number: '9152987821', display: '9152987821', altNumber: null,
//     website: 'https://icallhelpline.org', hours: 'Mon–Sat, 8 AM – 10 PM',
//     languages: ['English', 'Hindi', 'Marathi'], color: '#4BBFA5', emoji: '🟢',
//   },
//   {
//     id: 2, name: 'Tele MANAS', tagline: 'Govt. of India National Helpline',
//     number: '14416', display: '14416', altNumber: '1800-891-4416',
//     website: 'https://telemanas.mohfw.gov.in', hours: '24/7',
//     languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
//       'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Urdu', '+ more'],
//     color: C.primary, emoji: '🔵',
//   },
//   {
//     id: 3, name: 'Vandrevala Foundation', tagline: '24/7 Mental Health Helpline',
//     number: '9999666555', display: '9999 666 555', altNumber: '1860-2662-345',
//     website: 'https://www.vandrevalafoundation.com', hours: '24/7',
//     languages: ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil',
//       'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'],
//     color: '#7B6CF6', emoji: '🟣',
//   },
//   {
//     id: 4, name: 'AASRA', tagline: 'Suicide Prevention & Crisis Support',
//     number: '9820466627', display: '9820466627', altNumber: '022-27546669',
//     website: 'http://www.aasra.info', hours: '24/7',
//     languages: ['English', 'Hindi'], color: '#E8625A', emoji: '🔴',
//   },
//   {
//     id: 5, name: 'Fortis Mental Health', tagline: 'Fortis Healthcare Helpline',
//     number: '8376804102', display: '8376804102', altNumber: null,
//     website: 'https://www.fortishealthcare.com', hours: '24/7',
//     languages: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu',
//       'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi',
//       'Odia', 'Assamese', 'Urdu', 'Rajasthani', 'Bhojpuri'],
//     color: '#5BB8F5', emoji: '🏥',
//   },
//   {
//     id: 6, name: '1Life', tagline: 'Suicide Prevention & Crisis Support',
//     number: '7893078930', display: '78930 78930', altNumber: null,
//     website: 'https://www.1life.org.in', hours: '24/7',
//     languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
//       'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu'],
//     color: '#F5A623', emoji: '🟠',
//   },
//   {
//     id: 7, name: 'Arpita Foundation', tagline: 'Mental Health & Counselling (Bangalore)',
//     number: '08023655557', display: '080-23655557', altNumber: '08023655556',
//     website: 'https://www.arpitafoundation.org', hours: 'Mon–Sat, 9 AM – 7 PM',
//     languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
//       'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu'],
//     color: '#E91E8C', emoji: '🩷',
//   },
//   {
//     id: 8, name: 'Mann Talks', tagline: 'Mental Health Awareness & Support',
//     number: '8686139139', display: '8686139139', altNumber: null,
//     website: 'https://www.manntalks.org', hours: 'Mon–Sat, 10 AM – 6 PM',
//     languages: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali'],
//     color: '#607D8B', emoji: '💙',
//   },
// ];

// function OrgCard({ org }) {
//   const [expanded, setExpanded] = useState(false);

//   const call = (num) => {
//     const cleaned = num.replace(/[^0-9]/g, '');
//     Linking.openURL(`tel:${cleaned}`).catch(() =>
//       Alert.alert('Error', 'Could not open dialer.')
//     );
//   };

//   const openWeb = (url) => {
//     Linking.openURL(url).catch(() =>
//       Alert.alert('Error', 'Could not open website.')
//     );
//   };

//   // Make a soft background from the org color
//   const softBg = org.color + '14'; // 8% opacity hex

//   return (
//     <View style={[s.card, { borderLeftColor: org.color }]}>
//       {/* Card header — tap to expand */}
//       <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>
//         <View style={[s.emojiBox, { backgroundColor: softBg }]}>
//           <Text style={{ fontSize: 20 }}>{org.emoji}</Text>
//         </View>
//         <View style={s.cardTitleBlock}>
//           <Text style={s.cardName}>{org.name}</Text>
//           <Text style={s.cardTagline}>{org.tagline}</Text>
//         </View>
//         <Text style={[s.expandIcon, { color: org.color }]}>{expanded ? '▲' : '▼'}</Text>
//       </TouchableOpacity>

//       {/* Primary call button */}
//       <TouchableOpacity
//         style={[s.callBtn, { backgroundColor: org.color }]}
//         onPress={() => call(org.number)}
//         activeOpacity={0.85}
//       >
//         <Text style={s.callBtnTxt}>📞  {org.display}</Text>
//       </TouchableOpacity>

//       {/* Expanded detail */}
//       {expanded && (
//         <View style={s.detail}>
//           {org.altNumber && (
//             <TouchableOpacity style={s.altCallBtn} onPress={() => call(org.altNumber)} activeOpacity={0.85}>
//               <Text style={[s.altCallTxt, { color: org.color }]}>📞  Alt: {org.altNumber}</Text>
//             </TouchableOpacity>
//           )}
//           <View style={s.detailRow}>
//             <Text style={s.detailIcon}>🕐</Text>
//             <Text style={s.detailTxt}>{org.hours}</Text>
//           </View>
//           <View style={s.detailRow}>
//             <Text style={s.detailIcon}>🗣️</Text>
//             <Text style={s.detailTxt}>{org.languages.join(' • ')}</Text>
//           </View>
//           <TouchableOpacity style={s.webBtn} onPress={() => openWeb(org.website)} activeOpacity={0.85}>
//             <Text style={s.webBtnTxt}>
//               🌐  {org.website.replace('https://', '').replace('http://', '')}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// export default function HelplineScreen({ navigation }) {
//   const callEmergency = () => {
//     Linking.openURL('tel:112').catch(() =>
//       Alert.alert('Error', 'Could not open dialer.')
//     );
//   };

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

//       {/* Header */}
//       <View style={s.header}>
//         <View style={s.decor} />
//         <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
//           <Text style={s.backTxt}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={s.headerTitle}>Mental Health Helplines</Text>
//         <Text style={s.headerSub}>Confidential support — available anytime</Text>
//       </View>

//       <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

//         {/* Emergency banner */}
//         <TouchableOpacity style={s.emergencyBanner} onPress={callEmergency} activeOpacity={0.85}>
//           <Text style={s.emergencyTitle}>🚨  Life-threatening emergency?</Text>
//           <Text style={s.emergencyNumber}>Call 112</Text>
//           <Text style={s.emergencySub}>Ambulance: 102</Text>
//         </TouchableOpacity>

//         <Text style={s.hint}>Tap a card to expand details · Tap the number to call directly</Text>

//         <View style={s.body}>
//           {ORGANIZATIONS.map(org => <OrgCard key={org.id} org={org} />)}
//         </View>

//         {/* Bottom note */}
//         <View style={s.noteCard}>
//           <Text style={s.noteTxt}>💬  All calls are confidential. Reaching out is a sign of strength.</Text>
//         </View>

//         {/* Tips */}
//         <View style={s.tipsCard}>
//           <Text style={s.tipsTitle}>💡  Tips</Text>
//           <Text style={s.tip}>• Call during listed hours for best availability</Text>
//           <Text style={s.tip}>• Tele MANAS & Vandrevala are available 24/7</Text>
//           <Text style={s.tip}>• For emergencies, always call 112 first</Text>
//         </View>

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:             { flex: 1, backgroundColor: C.bg },
//   header:           { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   decor:            { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:          { marginBottom: 10 },
//   backTxt:          { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:      { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:        { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

//   scroll:           { flex: 1 },
//   body:             { paddingHorizontal: 16, paddingBottom: 4 },
//   hint:             { fontSize: 12, color: C.textLight, textAlign: 'center', marginVertical: 10 },

//   emergencyBanner:  { backgroundColor: '#C0392B', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 4, shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
//   emergencyTitle:   { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
//   emergencyNumber:  { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 2 },
//   emergencySub:     { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

//   // Card
//   card:             { backgroundColor: C.card, borderRadius: 16, marginBottom: 12, borderLeftWidth: 5, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, overflow: 'hidden' },
//   cardHeader:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
//   emojiBox:         { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   cardTitleBlock:   { flex: 1 },
//   cardName:         { fontSize: 15, fontWeight: '700', color: C.text },
//   cardTagline:      { fontSize: 11, color: C.textMid, marginTop: 2 },
//   expandIcon:       { fontSize: 11, fontWeight: '700', paddingLeft: 4 },

//   callBtn:          { marginHorizontal: 14, marginBottom: 14, padding: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
//   callBtnTxt:       { color: '#fff', fontWeight: '700', fontSize: 15 },

//   detail:           { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
//   altCallBtn:       { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: C.primaryLight, alignItems: 'center', marginBottom: 6 },
//   altCallTxt:       { fontSize: 14, fontWeight: '700' },
//   detailRow:        { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
//   detailIcon:       { fontSize: 14, marginRight: 8, marginTop: 1 },
//   detailTxt:        { fontSize: 13, color: C.textMid, flex: 1, lineHeight: 19 },
//   webBtn:           { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#E8F5EE', alignItems: 'center' },
//   webBtnTxt:        { fontSize: 12, color: '#2E7D32', fontWeight: '600' },

//   noteCard:         { backgroundColor: C.primaryLight, borderRadius: 14, marginHorizontal: 16, padding: 14, alignItems: 'center', marginBottom: 12 },
//   noteTxt:          { fontSize: 13, color: C.primary, fontWeight: '600', textAlign: 'center' },

//   tipsCard:         { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
//   tipsTitle:        { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
//   tip:              { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
// });

// src/screens/HelplineScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, StatusBar,
} from 'react-native';
import { C } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const ORGANIZATIONS = [
  {
    id: 1, name: 'iCall', tagline: 'TISS Professional Counselling',
    number: '9152987821', display: '9152987821', altNumber: null,
    website: 'https://icallhelpline.org', hours: 'Mon–Sat, 8 AM – 10 PM',
    languages: ['English', 'Hindi', 'Marathi'],
    color: '#4BBFA5', bg: '#E3F9F5', icon: 'phone-in-talk',
  },
  {
    id: 2, name: 'Tele MANAS', tagline: 'Govt. of India National Helpline',
    number: '14416', display: '14416', altNumber: '1800-891-4416',
    website: 'https://telemanas.mohfw.gov.in', hours: '24/7',
    languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
      'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Urdu', '+ more'],
    color: C.primary, bg: C.primaryLight, icon: 'phone-dial',
  },
  {
    id: 3, name: 'Vandrevala Foundation', tagline: '24/7 Mental Health Helpline',
    number: '9999666555', display: '9999 666 555', altNumber: '1860-2662-345',
    website: 'https://www.vandrevalafoundation.com', hours: '24/7',
    languages: ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil',
      'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'],
    color: '#7B6CF6', bg: '#EEF0FF', icon: 'phone-in-talk',
  },
  {
    id: 4, name: 'AASRA', tagline: 'Suicide Prevention & Crisis Support',
    number: '9820466627', display: '9820466627', altNumber: '022-27546669',
    website: 'http://www.aasra.info', hours: '24/7',
    languages: ['English', 'Hindi'],
    color: '#E8625A', bg: '#FFF0EE', icon: 'lifebuoy',
  },
  {
    id: 5, name: 'Fortis Mental Health', tagline: 'Fortis Healthcare Helpline',
    number: '8376804102', display: '8376804102', altNumber: null,
    website: 'https://www.fortishealthcare.com', hours: '24/7',
    languages: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu',
      'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi',
      'Odia', 'Assamese', 'Urdu', 'Rajasthani', 'Bhojpuri'],
    color: '#5BB8F5', bg: '#E3F6FF', icon: 'hospital-building',
  },
  {
    id: 6, name: '1Life', tagline: 'Suicide Prevention & Crisis Support',
    number: '7893078930', display: '78930 78930', altNumber: null,
    website: 'https://www.1life.org.in', hours: '24/7',
    languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
      'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu'],
    color: '#F5A623', bg: '#FFF7E6', icon: 'hand-heart',
  },
  {
    id: 7, name: 'Arpita Foundation', tagline: 'Mental Health & Counselling (Bangalore)',
    number: '08023655557', display: '080-23655557', altNumber: '08023655556',
    website: 'https://www.arpitafoundation.org', hours: 'Mon–Sat, 9 AM – 7 PM',
    languages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
      'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu'],
    color: '#E91E8C', bg: '#FFF0F8', icon: 'account-heart-outline',
  },
  {
    id: 8, name: 'Mann Talks', tagline: 'Mental Health Awareness & Support',
    number: '8686139139', display: '8686139139', altNumber: null,
    website: 'https://www.manntalks.org', hours: 'Mon–Sat, 10 AM – 6 PM',
    languages: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali'],
    color: '#607D8B', bg: '#ECEFF1', icon: 'head-heart',
  },
];

function OrgCard({ org }) {
  const [expanded, setExpanded] = useState(false);

  const call = (num) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => Alert.alert('Error', 'Could not open dialer.'));
  };
  const openWeb = (url) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open website.'));
  };

  return (
    <View style={[s.card, { borderLeftColor: org.color }]}>
      <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>
        <View style={[s.iconBox, { backgroundColor: org.bg }]}>
          <Icon name={org.icon} size={20} color={org.color} />
        </View>
        <View style={s.cardTitleBlock}>
          <Text style={s.cardName}>{org.name}</Text>
          <Text style={s.cardTagline}>{org.tagline}</Text>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={org.color} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.callBtn, { backgroundColor: org.color }]}
        onPress={() => call(org.number)}
        activeOpacity={0.85}
      >
        <Icon name="phone" size={16} color="#fff" />
        <Text style={s.callBtnTxt}>  {org.display}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={s.detail}>
          {org.altNumber && (
            <TouchableOpacity style={[s.altCallBtn, { backgroundColor: org.bg }]} onPress={() => call(org.altNumber)} activeOpacity={0.85}>
              <Icon name="phone-plus" size={14} color={org.color} />
              <Text style={[s.altCallTxt, { color: org.color }]}>  Alt: {org.altNumber}</Text>
            </TouchableOpacity>
          )}
          <View style={s.detailRow}>
            <Icon name="clock-outline" size={15} color={C.textMid} />
            <Text style={s.detailTxt}>  {org.hours}</Text>
          </View>
          <View style={s.detailRow}>
            <Icon name="translate" size={15} color={C.textMid} />
            <Text style={s.detailTxt}>  {org.languages.join(' • ')}</Text>
          </View>
          <TouchableOpacity style={s.webBtn} onPress={() => openWeb(org.website)} activeOpacity={0.85}>
            <Icon name="web" size={14} color="#2E7D32" />
            <Text style={s.webBtnTxt}>  {org.website.replace('https://', '').replace('http://', '')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function HelplineScreen({ navigation }) {
  const callEmergency = () => {
    Linking.openURL('tel:112').catch(() => Alert.alert('Error', 'Could not open dialer.'));
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={s.header}>
        <View style={s.decor} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={s.backTxt}> Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mental Health Helplines</Text>
        <Text style={s.headerSub}>Confidential support — available anytime</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={s.emergencyBanner} onPress={callEmergency} activeOpacity={0.85}>
          <View style={s.emergencyLeft}>
            <Icon name="ambulance" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.emergencyTitle}>Life-threatening emergency?</Text>
            <Text style={s.emergencyNumber}>Call 112</Text>
            <Text style={s.emergencySub}>Ambulance: 102</Text>
          </View>
          <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Text style={s.hint}>Tap a card to expand · Tap the number to call</Text>

        <View style={s.body}>
          {ORGANIZATIONS.map(org => <OrgCard key={org.id} org={org} />)}
        </View>

        <View style={s.noteCard}>
          <Icon name="shield-check" size={18} color={C.primary} />
          <Text style={s.noteTxt}> All calls are confidential. Reaching out is a sign of strength.</Text>
        </View>

        <View style={s.tipsCard}>
          <View style={s.tipsTitleRow}>
            <Icon name="lightbulb-outline" size={15} color={C.text} />
            <Text style={s.tipsTitleTxt}> Tips</Text>
          </View>
          <View style={s.tipRow}>
            <Icon name="clock-outline" size={13} color={C.textMid} />
            <Text style={s.tip}> Call during listed hours for best availability</Text>
          </View>
          <View style={s.tipRow}>
            <Icon name="phone-check" size={13} color={C.textMid} />
            <Text style={s.tip}> Tele MANAS & Vandrevala are available 24/7</Text>
          </View>
          <View style={s.tipRow}>
            <Icon name="alert-circle-outline" size={13} color={C.textMid} />
            <Text style={s.tip}> For emergencies, always call 112 first</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  scroll:         { flex: 1 },
  hint:           { fontSize: 12, color: C.textLight, textAlign: 'center', marginVertical: 10 },
  body:           { paddingHorizontal: 16, paddingBottom: 4 },
  emergencyBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#C0392B', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, elevation: 4, shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, gap: 12 },
  emergencyLeft:  { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  emergencyTitle: { color: '#fff', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  emergencyNumber:{ color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  emergencySub:   { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  card:           { backgroundColor: C.card, borderRadius: 16, marginBottom: 12, borderLeftWidth: 5, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, overflow: 'hidden' },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox:        { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitleBlock: { flex: 1 },
  cardName:       { fontSize: 15, fontWeight: '700', color: C.text },
  cardTagline:    { fontSize: 11, color: C.textMid, marginTop: 2 },
  callBtn:        { marginHorizontal: 14, marginBottom: 14, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 2 },
  callBtnTxt:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  detail:         { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
  altCallBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 10, borderRadius: 10, marginBottom: 6 },
  altCallTxt:     { fontSize: 14, fontWeight: '700' },
  detailRow:      { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  detailTxt:      { fontSize: 13, color: C.textMid, flex: 1, lineHeight: 18 },
  webBtn:         { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#E8F5EE' },
  webBtnTxt:      { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  noteCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 14, marginHorizontal: 16, padding: 14, marginBottom: 12 },
  noteTxt:        { fontSize: 13, color: C.primary, fontWeight: '600' },
  tipsCard:       { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
  tipsTitleRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tipsTitleTxt:   { fontSize: 13, fontWeight: '700', color: C.text },
  tipRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tip:            { fontSize: 12, color: C.textMid, lineHeight: 19, flex: 1 },
});