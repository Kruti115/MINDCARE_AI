// // // src/screens/AudioAnalysisScreen.js — NO NETINFO, OFFLINE QUEUE, SYNC FIXED
// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   View, Text, StyleSheet, TouchableOpacity,
// //   ActivityIndicator, ScrollView, Alert,
// // } from 'react-native';
// // import { Audio } from 'expo-av';
// // import { analyzeAudio, formatEmotion, getWellnessColor } from '../services/audioApi';
// // import { saveMoodEntry } from '../utils/moodStorage';
// // import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
// // import CrisisAlert from '../components/CrisisAlert';

// // const checkOnline = async () => {
// //   try {
// //     const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
// //     return res.status === 204;
// //   } catch { return false; }
// // };

// // export default function AudioAnalysisScreen({ navigation }) {
// //   const [recording, setRecording]                 = useState(null);
// //   const [isRecording, setIsRecording]             = useState(false);
// //   const [isAnalyzing, setIsAnalyzing]             = useState(false);
// //   const [recordingDuration, setRecordingDuration] = useState(0);
// //   const [analysisResult, setAnalysisResult]       = useState(null);
// //   const [permissionGranted, setPermissionGranted] = useState(false);
// //   const [showCrisisAlert, setShowCrisisAlert]     = useState(false);
// //   const [isOffline, setIsOffline]                 = useState(false);
// //   const [pendingCount, setPendingCount]           = useState(0);
// //   const [isSyncing, setIsSyncing]                 = useState(false);
// //   const [savedUri, setSavedUri]                   = useState(null);

// //   const durationRef  = useRef(null);
// //   // ── Guard: prevents syncQueue being called while already syncing ──────────
// //   const isSyncingRef = useRef(false);
// //   // ── Guard: prevents duplicate sync calls in the same polling tick ─────────
// //   const wasOfflineRef = useRef(false);

// //   useEffect(() => {
// //     requestPermissions();
// //     checkStatus();

// //     const interval = setInterval(async () => {
// //       const online = await checkOnline();
// //       setIsOffline(!online);

// //       if (online) {
// //         // Only trigger sync when transitioning from offline → online
// //         // OR if there are pending items and we're not already syncing
// //         if (wasOfflineRef.current || (!isSyncingRef.current)) {
// //           syncQueue();
// //         }
// //         wasOfflineRef.current = false;
// //       } else {
// //         wasOfflineRef.current = true;
// //       }
// //     }, 10000);

// //     return () => {
// //       clearInterval(interval);
// //       if (recording) recording.stopAndUnloadAsync();
// //       if (durationRef.current) clearInterval(durationRef.current);
// //     };
// //   }, []);

// //   const checkStatus = async () => {
// //     const online = await checkOnline();
// //     setIsOffline(!online);
// //     wasOfflineRef.current = !online;
// //     const count = await getQueueCount('audio');
// //     setPendingCount(count);
// //     if (online && count > 0) syncQueue();
// //   };

// //   const syncQueue = async () => {
// //     // Hard guard — if already syncing, do nothing
// //     if (isSyncingRef.current) return;

// //     const count = await getQueueCount('audio');
// //     if (!count) return;

// //     isSyncingRef.current = true;
// //     setIsSyncing(true);
// //     try {
// //       const done = await processQueue();
// //       if (done > 0) {
// //         Alert.alert('✅ Synced!', `${done} saved recording(s) analyzed and added to mood history.`);
// //       }
// //       setPendingCount(await getQueueCount('audio'));
// //     } catch (e) {
// //       console.error('syncQueue error:', e);
// //     } finally {
// //       isSyncingRef.current = false;
// //       setIsSyncing(false);
// //     }
// //   };

// //   const requestPermissions = async () => {
// //     try {
// //       const { status } = await Audio.requestPermissionsAsync();
// //       setPermissionGranted(status === 'granted');
// //       if (status !== 'granted') Alert.alert('Permission Required', 'MindCare needs microphone access.');
// //     } catch (e) { Alert.alert('Error', `Permission check failed: ${e.message}`); }
// //   };

// //   const startRecording = async () => {
// //     if (!permissionGranted) { await requestPermissions(); return; }
// //     try {
// //       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
// //       const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
// //       setRecording(rec);
// //       setIsRecording(true);
// //       setRecordingDuration(0);
// //       setAnalysisResult(null);
// //       setSavedUri(null);
// //       setShowCrisisAlert(false);
// //       durationRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
// //     } catch (e) { Alert.alert('Recording Error', `Could not start: ${e.message}`); }
// //   };

// //   const stopRecording = async () => {
// //     if (!recording) return;
// //     if (durationRef.current) { clearInterval(durationRef.current); durationRef.current = null; }
// //     try {
// //       await recording.stopAndUnloadAsync();
// //       const uri = recording.getURI();
// //       setIsRecording(false);
// //       setRecording(null);
// //       if (uri) await handleRecordingDone(uri);
// //       else Alert.alert('Error', 'Could not get recording. Please try again.');
// //     } catch (e) { Alert.alert('Error', `Stop failed: ${e.message}`); }
// //   };

// //   const handleRecordingDone = async (uri) => {
// //     const online = await checkOnline();
// //     setIsOffline(!online);
// //     if (online) {
// //       await runAnalysis(uri);
// //     } else {
// //       setSavedUri(uri);
// //       Alert.alert('📡 No Internet Connection', 'Choose what to do:', [
// //         {
// //           text: '💾 Save for Later',
// //           onPress: async () => {
// //             // Copy from Expo cache → permanent storage so it survives app restart
// //             const permUri = await copyToPermStorage(uri, 'audio');
// //             await addToQueue({ type: 'audio', uri: permUri });
// //             setPendingCount(await getQueueCount('audio'));
// //             Alert.alert('✅ Saved!', 'Will be automatically analyzed when you reconnect.');
// //           },
// //         },
// //         { text: '📝 Switch to Text', onPress: () => navigation.navigate('TextAnalysis') },
// //         { text: 'Cancel', style: 'cancel' },
// //       ]);
// //     }
// //   };

// //   const runAnalysis = async (uri) => {
// //     setIsAnalyzing(true);
// //     try {
// //       const result = await analyzeAudio(uri);
// //       if (result.status === 'success') {
// //         setAnalysisResult(result.data);
// //         await saveMoodEntry(result.data, { hasAudio: true });
// //         if (result.data.wellness_score <= 3.0) setShowCrisisAlert(true);
// //       } else throw new Error('failed');
// //     } catch {
// //       Alert.alert('Analysis Failed', "Save it for when you're back online?", [
// //         {
// //           text: '💾 Save for Later',
// //           onPress: async () => {
// //             // Copy from Expo cache → permanent storage before queuing
// //             const permUri = await copyToPermStorage(uri, 'audio');
// //             await addToQueue({ type: 'audio', uri: permUri });
// //             setPendingCount(await getQueueCount('audio'));
// //             Alert.alert('✅ Saved!', 'Will auto-analyze when connection is restored.');
// //           },
// //         },
// //         { text: 'Dismiss', style: 'cancel' },
// //       ]);
// //     } finally { setIsAnalyzing(false); }
// //   };

// //   const retryNow = async () => {
// //     if (!savedUri) return;
// //     const online = await checkOnline();
// //     if (!online) { Alert.alert('Still Offline', 'No internet yet. Recording is saved safely.'); return; }
// //     setIsOffline(false);
// //     const uri = savedUri;
// //     setSavedUri(null);
// //     await runAnalysis(uri);
// //   };

// //   const resetScreen = () => {
// //     setAnalysisResult(null);
// //     setRecordingDuration(0);
// //     setSavedUri(null);
// //     setShowCrisisAlert(false);
// //   };

// //   const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

// //   return (
// //     <ScrollView style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //           <Text style={styles.backButtonText}>← Back</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>🎙️ Audio Analysis</Text>
// //         <Text style={styles.headerSubtitle}>Analyze emotions from your voice</Text>
// //       </View>

// //       {isOffline && (
// //         <View style={styles.offlineBanner}>
// //           <Text style={styles.offlineIcon}>📡</Text>
// //           <Text style={styles.offlineText}>You're offline. Recordings will be saved and auto-analyzed when you reconnect.</Text>
// //         </View>
// //       )}

// //       {pendingCount > 0 && !isOffline && (
// //         <TouchableOpacity style={styles.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.8}>
// //           {isSyncing
// //             ? <View style={styles.syncRow}><ActivityIndicator size="small" color="white" /><Text style={styles.syncText}> Analyzing {pendingCount} saved recording(s)…</Text></View>
// //             : <Text style={styles.syncText}>📬 {pendingCount} saved recording(s) — Tap to analyze now</Text>}
// //         </TouchableOpacity>
// //       )}

// //       <View style={styles.controlsContainer}>
// //         {!isRecording ? (
// //           <TouchableOpacity
// //             style={[styles.outerCircle, !permissionGranted && styles.disabledCircle]}
// //             onPress={startRecording}
// //             disabled={!permissionGranted}
// //           >
// //             <View style={styles.innerCircle}><Text style={styles.micIcon}>🎙️</Text></View>
// //             <Text style={styles.recordLabel}>{permissionGranted ? 'Tap to Record' : 'Permission Needed'}</Text>
// //           </TouchableOpacity>
// //         ) : (
// //           <TouchableOpacity style={styles.outerCircleRecording} onPress={stopRecording}>
// //             <View style={styles.stopCircle}><Text style={styles.stopIcon}>⏹</Text></View>
// //             <Text style={styles.durationLabel}>{fmt(recordingDuration)}</Text>
// //             <Text style={styles.stopLabel}>Tap to Stop & Analyze</Text>
// //           </TouchableOpacity>
// //         )}
// //         {!permissionGranted && (
// //           <TouchableOpacity style={styles.grantButton} onPress={requestPermissions}>
// //             <Text style={styles.grantButtonText}>Grant Microphone Permission</Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {savedUri && !isAnalyzing && !analysisResult && (
// //         <View style={styles.savedCard}>
// //           <Text style={styles.savedTitle}>💾 Recording Ready</Text>
// //           <Text style={styles.savedDesc}>Saved locally. Reconnect to analyze, or switch to text analysis.</Text>
// //           <View style={styles.savedActions}>
// //             <TouchableOpacity style={styles.retryBtn} onPress={retryNow}><Text style={styles.retryBtnText}>🔄 Retry Now</Text></TouchableOpacity>
// //             <TouchableOpacity style={styles.textBtn} onPress={() => navigation.navigate('TextAnalysis')}><Text style={styles.textBtnText}>📝 Use Text</Text></TouchableOpacity>
// //           </View>
// //         </View>
// //       )}

// //       {isAnalyzing && (
// //         <View style={styles.loadingBox}>
// //           <ActivityIndicator size="large" color="#6C63FF" />
// //           <Text style={styles.loadingText}>Analyzing your voice…</Text>
// //           <Text style={styles.loadingSubText}>This may take a few seconds</Text>
// //         </View>
// //       )}

// //       {analysisResult && (() => {
// //         const { emotion, wellness_score, interpretation } = analysisResult;
// //         const wColor = getWellnessColor(wellness_score);
// //         return (
// //           <View style={styles.resultContainer}>
// //             <Text style={styles.resultsTitle}>📊 Analysis Results</Text>
// //             <View style={styles.emotionCard}>
// //               <Text style={styles.emotionCardLabel}>Detected Emotion</Text>
// //               <Text style={styles.emotionCardValue}>{formatEmotion(emotion.primary)}</Text>
// //               <Text style={styles.emotionCardConf}>Confidence: {(emotion.confidence * 100).toFixed(1)}%</Text>
// //             </View>
// //             <View style={styles.wellnessCard}>
// //               <Text style={styles.wellnessCardLabel}>Wellness Score</Text>
// //               <View style={styles.wellnessRow}>
// //                 <Text style={[styles.wellnessScore, { color: wColor }]}>{wellness_score.toFixed(1)}</Text>
// //                 <Text style={styles.wellnessMax}>/10</Text>
// //               </View>
// //               <View style={styles.wellnessBar}>
// //                 <View style={[styles.wellnessFill, { width: `${(wellness_score / 10) * 100}%`, backgroundColor: wColor }]} />
// //               </View>
// //             </View>
// //             <View style={styles.interpretCard}>
// //               <Text style={styles.interpretTitle}>💭 Interpretation</Text>
// //               <Text style={styles.interpretText}>{interpretation}</Text>
// //             </View>
// //             <View style={styles.probCard}>
// //               <Text style={styles.probTitle}>All Detected Emotions</Text>
// //               {Object.entries(emotion.all_probabilities).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
// //                 <View key={emo} style={styles.probRow}>
// //                   <Text style={styles.probLabel}>{formatEmotion(emo)}</Text>
// //                   <View style={styles.probBarWrap}><View style={[styles.probBar, { width: `${prob * 100}%` }]} /></View>
// //                   <Text style={styles.probPct}>{(prob * 100).toFixed(0)}%</Text>
// //                 </View>
// //               ))}
// //             </View>
// //             <TouchableOpacity style={styles.resetButton} onPress={resetScreen}>
// //               <Text style={styles.resetButtonText}>🔄 Record Again</Text>
// //             </TouchableOpacity>
// //           </View>
// //         );
// //       })()}

// //       <View style={styles.tipBox}>
// //         <Text style={styles.tipTitle}>💡 Tips for best results</Text>
// //         <Text style={styles.tipText}>• Speak naturally for 5–10 seconds</Text>
// //         <Text style={styles.tipText}>• Find a quiet environment</Text>
// //         <Text style={styles.tipText}>• Recordings are saved if you go offline</Text>
// //       </View>
// //       <View style={{ height: 30 }} />
// //       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisisAlert(false)} />
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F8F9FA' },
// //   header: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
// //   backButton: { marginBottom: 10 },
// //   backButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
// //   headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
// //   headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
// //   offlineBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9800', margin: 15, padding: 12, borderRadius: 10, gap: 8 },
// //   offlineIcon: { fontSize: 18 },
// //   offlineText: { flex: 1, color: 'white', fontSize: 13, fontWeight: '600' },
// //   syncBanner: { backgroundColor: '#6C63FF', marginHorizontal: 15, marginTop: 10, padding: 12, borderRadius: 10, alignItems: 'center' },
// //   syncRow: { flexDirection: 'row', alignItems: 'center' },
// //   syncText: { color: 'white', fontSize: 13, fontWeight: '600', textAlign: 'center' },
// //   controlsContainer: { alignItems: 'center', paddingVertical: 30 },
// //   outerCircle: { alignItems: 'center', borderWidth: 3, borderColor: '#6C63FF', borderRadius: 80, padding: 10 },
// //   disabledCircle: { borderColor: '#CCC', opacity: 0.5 },
// //   innerCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 },
// //   micIcon: { fontSize: 52 },
// //   recordLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 8 },
// //   outerCircleRecording: { alignItems: 'center', borderWidth: 3, borderColor: '#EF4444', borderRadius: 80, padding: 10 },
// //   stopCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 4 },
// //   stopIcon: { fontSize: 44 },
// //   durationLabel: { fontSize: 22, fontWeight: 'bold', color: '#EF4444', marginTop: 4 },
// //   stopLabel: { fontSize: 13, color: '#666', marginTop: 4 },
// //   grantButton: { marginTop: 20, backgroundColor: '#6C63FF', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
// //   grantButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
// //   savedCard: { backgroundColor: 'white', margin: 15, padding: 18, borderRadius: 16, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
// //   savedTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   savedDesc: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 14 },
// //   savedActions: { flexDirection: 'row', gap: 10 },
// //   retryBtn: { flex: 1, backgroundColor: '#6C63FF', padding: 12, borderRadius: 10, alignItems: 'center' },
// //   retryBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
// //   textBtn: { flex: 1, backgroundColor: '#EDE7F6', padding: 12, borderRadius: 10, alignItems: 'center' },
// //   textBtnText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
// //   loadingBox: { alignItems: 'center', padding: 30 },
// //   loadingText: { marginTop: 14, fontSize: 16, color: '#6C63FF', fontWeight: '600' },
// //   loadingSubText: { marginTop: 5, fontSize: 13, color: '#999' },
// //   resultContainer: { paddingHorizontal: 15, paddingBottom: 10 },
// //   resultsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 14 },
// //   emotionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center', elevation: 3 },
// //   emotionCardLabel: { fontSize: 13, color: '#999', marginBottom: 5 },
// //   emotionCardValue: { fontSize: 30, fontWeight: 'bold', color: '#6C63FF', marginBottom: 5 },
// //   emotionCardConf: { fontSize: 13, color: '#666' },
// //   wellnessCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 12, elevation: 3 },
// //   wellnessCardLabel: { fontSize: 13, color: '#999', marginBottom: 8 },
// //   wellnessRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
// //   wellnessScore: { fontSize: 44, fontWeight: 'bold' },
// //   wellnessMax: { fontSize: 22, color: '#999', marginLeft: 4 },
// //   wellnessBar: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, overflow: 'hidden' },
// //   wellnessFill: { height: '100%', borderRadius: 5 },
// //   interpretCard: { backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, elevation: 3 },
// //   interpretTitle: { fontSize: 14, fontWeight: '700', color: '#6C63FF', marginBottom: 8 },
// //   interpretText: { fontSize: 14, color: '#444', lineHeight: 21 },
// //   probCard: { backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, elevation: 3 },
// //   probTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 14 },
// //   probRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
// //   probLabel: { width: 100, fontSize: 13, color: '#333' },
// //   probBarWrap: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
// //   probBar: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
// //   probPct: { width: 38, fontSize: 12, color: '#666', textAlign: 'right' },
// //   resetButton: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 10, elevation: 2 },
// //   resetButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
// //   tipBox: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginHorizontal: 15, marginTop: 4, marginBottom: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6C63FF' },
// //   tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   tipText: { fontSize: 13, color: '#666', marginBottom: 3 },
// // });

// // src/screens/AudioAnalysisScreen.js
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity,
//   ActivityIndicator, ScrollView, Alert, StatusBar,
// } from 'react-native';
// import { Audio } from 'expo-av';
// import { analyzeAudio, formatEmotion } from '../services/audioApi';
// import { saveMoodEntry } from '../utils/moodStorage';
// import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
// import CrisisAlert from '../components/CrisisAlert';
// import { C, getEmoji, getWellnessColor, getWellnessLabel } from '../theme';

// const checkOnline = async () => {
//   try {
//     const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
//     return res.status === 204;
//   } catch { return false; }
// };

// const EMOTION_COLORS = {
//   happy: C.primary, calm: '#5BB8F5', neutral: C.textLight,
//   sad: '#5BB8F5', fearful: C.purple, angry: C.accentRed,
//   disgust: C.accentOrange, surprised: C.accentGreen,
// };

// export default function AudioAnalysisScreen({ navigation }) {
//   const [recording, setRecording]               = useState(null);
//   const [isRecording, setIsRecording]           = useState(false);
//   const [isAnalyzing, setIsAnalyzing]           = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [analysisResult, setAnalysisResult]     = useState(null);
//   const [permissionGranted, setPermission]      = useState(false);
//   const [showCrisisAlert, setShowCrisis]        = useState(false);
//   const [isOffline, setIsOffline]               = useState(false);
//   const [pendingCount, setPendingCount]         = useState(0);
//   const [isSyncing, setIsSyncing]               = useState(false);
//   const [savedUri, setSavedUri]                 = useState(null);

//   const durationRef   = useRef(null);
//   const isSyncingRef  = useRef(false);
//   const wasOfflineRef = useRef(false);

//   useEffect(() => {
//     requestPermissions();
//     checkStatus();
//     const interval = setInterval(async () => {
//       const online = await checkOnline();
//       setIsOffline(!online);
//       if (online) {
//         if (wasOfflineRef.current || !isSyncingRef.current) syncQueue();
//         wasOfflineRef.current = false;
//       } else { wasOfflineRef.current = true; }
//     }, 10000);
//     return () => {
//       clearInterval(interval);
//       if (recording) recording.stopAndUnloadAsync();
//       if (durationRef.current) clearInterval(durationRef.current);
//     };
//   }, []);

//   const checkStatus = async () => {
//     const online = await checkOnline();
//     setIsOffline(!online);
//     wasOfflineRef.current = !online;
//     const count = await getQueueCount('audio');
//     setPendingCount(count);
//     if (online && count > 0) syncQueue();
//   };

//   const syncQueue = async () => {
//     if (isSyncingRef.current) return;
//     const count = await getQueueCount('audio');
//     if (!count) return;
//     isSyncingRef.current = true; setIsSyncing(true);
//     try {
//       const done = await processQueue();
//       if (done > 0) Alert.alert('✅ Synced!', `${done} saved recording(s) analysed.`);
//       setPendingCount(await getQueueCount('audio'));
//     } catch (e) { console.error('syncQueue error:', e); }
//     finally { isSyncingRef.current = false; setIsSyncing(false); }
//   };

//   const requestPermissions = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       setPermission(status === 'granted');
//       if (status !== 'granted') Alert.alert('Permission Required', 'MindCare needs microphone access.');
//     } catch (e) { Alert.alert('Error', `Permission check failed: ${e.message}`); }
//   };

//   const startRecording = async () => {
//     if (!permissionGranted) { await requestPermissions(); return; }
//     try {
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(rec); setIsRecording(true); setRecordingDuration(0);
//       setAnalysisResult(null); setSavedUri(null); setShowCrisis(false);
//       durationRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
//     } catch (e) { Alert.alert('Recording Error', `Could not start: ${e.message}`); }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
//     if (durationRef.current) { clearInterval(durationRef.current); durationRef.current = null; }
//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setIsRecording(false); setRecording(null);
//       if (uri) await handleRecordingDone(uri);
//       else Alert.alert('Error', 'Could not get recording. Please try again.');
//     } catch (e) { Alert.alert('Error', `Stop failed: ${e.message}`); }
//   };

//   const handleRecordingDone = async (uri) => {
//     const online = await checkOnline();
//     setIsOffline(!online);
//     if (online) { await runAnalysis(uri); }
//     else {
//       setSavedUri(uri);
//       Alert.alert('No Internet', 'Choose what to do:', [
//         { text: 'Save for Later', onPress: async () => {
//           const permUri = await copyToPermStorage(uri, 'audio');
//           await addToQueue({ type: 'audio', uri: permUri });
//           setPendingCount(await getQueueCount('audio'));
//           Alert.alert('Saved!', 'Will be automatically analysed when you reconnect.');
//         }},
//         { text: 'Switch to Text', onPress: () => navigation.navigate('TextAnalysis') },
//         { text: 'Cancel', style: 'cancel' },
//       ]);
//     }
//   };

//   const runAnalysis = async (uri) => {
//     setIsAnalyzing(true);
//     try {
//       const result = await analyzeAudio(uri);
//       if (result.status === 'success') {
//         setAnalysisResult(result.data);
//         await saveMoodEntry(result.data, { hasAudio: true });
//         if (result.data.wellness_score <= 3.0) setShowCrisis(true);
//       } else throw new Error('failed');
//     } catch {
//       Alert.alert('Analysis Failed', "Save it for when you're back online?", [
//         { text: 'Save for Later', onPress: async () => {
//           const permUri = await copyToPermStorage(uri, 'audio');
//           await addToQueue({ type: 'audio', uri: permUri });
//           setPendingCount(await getQueueCount('audio'));
//           Alert.alert('Saved!', 'Will auto-analyse when connection is restored.');
//         }},
//         { text: 'Dismiss', style: 'cancel' },
//       ]);
//     } finally { setIsAnalyzing(false); }
//   };

//   const retryNow = async () => {
//     if (!savedUri) return;
//     const online = await checkOnline();
//     if (!online) { Alert.alert('Still Offline', 'No internet yet. Recording is saved safely.'); return; }
//     setIsOffline(false);
//     const uri = savedUri; setSavedUri(null);
//     await runAnalysis(uri);
//   };

//   const resetScreen = () => { setAnalysisResult(null); setRecordingDuration(0); setSavedUri(null); setShowCrisis(false); };
//   const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

//         <View style={s.header}>
//           <View style={s.decor} />
//           <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
//             <Text style={s.backTxt}>← Back</Text>
//           </TouchableOpacity>
//           <Text style={s.headerTitle}>Voice Analysis</Text>
//           <Text style={s.headerSub}>Speak naturally for 5–10 seconds</Text>
//         </View>

//         {isOffline && (
//           <View style={s.offlineBanner}>
//             <Text style={s.bannerTxt}>Offline — recordings saved, auto-analysed on reconnect</Text>
//           </View>
//         )}
//         {pendingCount > 0 && !isOffline && (
//           <TouchableOpacity style={s.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
//             {isSyncing
//               ? <View style={s.syncRow}><ActivityIndicator size="small" color="#fff" /><Text style={s.syncTxt}>  Analysing {pendingCount} saved recording(s)…</Text></View>
//               : <Text style={s.syncTxt}>📬  {pendingCount} saved recording(s) — Tap to analyse</Text>}
//           </TouchableOpacity>
//         )}

//         <View style={s.body}>
//           {/* Recorder card */}
//           <View style={s.recCard}>
//             {isRecording ? (
//               <>
//                 <View style={s.waveRow}>
//                   {[8,18,12,28,10,24,14,30,10,22,16,20,8].map((h, i) => (
//                     <View key={i} style={[s.wave, { height: h }]} />
//                   ))}
//                 </View>
//                 <Text style={s.timerTxt}>{fmt(recordingDuration)}</Text>
//                 <TouchableOpacity style={s.stopBtn} onPress={stopRecording} activeOpacity={0.85}>
//                   <Text style={s.stopIcon}>⏹</Text>
//                 </TouchableOpacity>
//                 <Text style={s.hint}>Tap to stop & analyse</Text>
//               </>
//             ) : (
//               <>
//                 <Text style={s.prompt}>{permissionGranted ? 'Ready to record' : 'Microphone permission required'}</Text>
//                 <TouchableOpacity
//                   style={[s.micBtn, !permissionGranted && s.micDisabled]}
//                   onPress={startRecording} disabled={!permissionGranted} activeOpacity={0.85}
//                 >
//                   <Text style={{ fontSize: 38 }}>🎙️</Text>
//                 </TouchableOpacity>
//                 <Text style={s.hint}>{permissionGranted ? 'Tap to Record' : 'Grant permission below'}</Text>
//               </>
//             )}
//           </View>

//           {!permissionGranted && (
//             <TouchableOpacity style={s.permBtn} onPress={requestPermissions} activeOpacity={0.85}>
//               <Text style={s.permBtnTxt}>Grant Microphone Permission</Text>
//             </TouchableOpacity>
//           )}

//           {savedUri && !isAnalyzing && !analysisResult && (
//             <View style={s.savedCard}>
//               <Text style={s.savedTitle}>Recording Saved Locally</Text>
//               <Text style={s.savedDesc}>Reconnect to analyse, or use Text Analysis instead.</Text>
//               <View style={s.savedRow}>
//                 <TouchableOpacity style={s.retryBtn} onPress={retryNow} activeOpacity={0.85}>
//                   <Text style={s.retryTxt}>Retry Now</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={s.textSwitchBtn} onPress={() => navigation.navigate('TextAnalysis')} activeOpacity={0.85}>
//                   <Text style={s.textSwitchTxt}>Use Text</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {isAnalyzing && (
//             <View style={s.loadCard}>
//               <ActivityIndicator size="large" color={C.primary} />
//               <Text style={s.loadTxt}>Analysing your voice…</Text>
//               <Text style={s.loadSub}>This may take a few seconds</Text>
//             </View>
//           )}

//           {analysisResult && !isAnalyzing && (() => {
//             const { emotion, wellness_score, interpretation } = analysisResult;
//             const wc = getWellnessColor(wellness_score);
//             return (
//               <>
//                 <View style={[s.resultHero, { borderTopColor: wc }]}>
//                   <Text style={{ fontSize: 54, marginBottom: 8 }}>{getEmoji(emotion.primary)}</Text>
//                   <Text style={s.resultEmo}>{emotion.primary?.charAt(0).toUpperCase() + emotion.primary?.slice(1)}</Text>
//                   <Text style={s.resultConf}>{(emotion.confidence * 100).toFixed(1)}% confidence</Text>
//                 </View>
//                 <View style={s.card}>
//                   <Text style={s.cardLbl}>Wellness Score</Text>
//                   <View style={s.wRow}>
//                     <Text style={[s.wBig, { color: wc }]}>{wellness_score.toFixed(1)}</Text>
//                     <Text style={s.wOf}>/10</Text>
//                     <View style={[s.wTag, { borderColor: wc }]}><Text style={[s.wTagTxt, { color: wc }]}>{getWellnessLabel(wellness_score)}</Text></View>
//                   </View>
//                   <View style={s.bar}><View style={[s.barFill, { width: `${(wellness_score / 10) * 100}%`, backgroundColor: wc }]} /></View>
//                 </View>
//                 <View style={s.card}>
//                   <Text style={s.cardLbl}>💭  Interpretation</Text>
//                   <Text style={s.interp}>{interpretation}</Text>
//                 </View>
//                 <View style={s.card}>
//                   <Text style={s.cardLbl}>All Detected Emotions</Text>
//                   {Object.entries(emotion.all_probabilities || {}).sort((a,b)=>b[1]-a[1]).map(([emo, prob]) => {
//                     const ec = EMOTION_COLORS[emo] || C.textLight;
//                     return (
//                       <View key={emo} style={s.probRow}>
//                         <Text style={s.probLbl}>{getEmoji(emo)}  {emo.charAt(0).toUpperCase()+emo.slice(1)}</Text>
//                         <View style={s.probWrap}><View style={[s.probFill, { width: `${prob*100}%`, backgroundColor: ec }]} /></View>
//                         <Text style={[s.probPct, { color: ec }]}>{(prob*100).toFixed(0)}%</Text>
//                       </View>
//                     );
//                   })}
//                 </View>
//                 <TouchableOpacity style={s.resetBtn} onPress={resetScreen} activeOpacity={0.85}>
//                   <Text style={s.resetTxt}>Record Again</Text>
//                 </TouchableOpacity>
//               </>
//             );
//           })()}

//           {!analysisResult && !isAnalyzing && (
//             <View style={s.tips}>
//               <Text style={s.tipsTitle}>💡  Tips</Text>
//               <Text style={s.tip}>• Speak naturally for 5–10 seconds</Text>
//               <Text style={s.tip}>• Find a quiet environment</Text>
//               <Text style={s.tip}>• Recordings are saved if you go offline</Text>
//             </View>
//           )}
//           <View style={{ height: 32 }} />
//         </View>
//       </ScrollView>
//       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:       { flex: 1, backgroundColor: C.bg },
//   scroll:     { flex: 1 },
//   header:     { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   decor:      { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:    { marginBottom: 10 },
//   backTxt:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:  { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
//   offlineBanner:{ backgroundColor: C.accentOrange, padding: 12, paddingHorizontal: 16 },
//   bannerTxt:  { color: '#fff', fontSize: 12, fontWeight: '600' },
//   syncBanner: { backgroundColor: C.primaryDark, padding: 12, paddingHorizontal: 16 },
//   syncRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   syncTxt:    { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
//   body:       { padding: 16 },
//   recCard:    { backgroundColor: C.card, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:12 },
//   waveRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 16 },
//   wave:       { width: 4, borderRadius: 2, backgroundColor: C.accentRed },
//   timerTxt:   { fontSize: 34, fontWeight: '700', color: C.accentRed, marginBottom: 18 },
//   stopBtn:    { width: 76, height: 76, borderRadius: 38, backgroundColor: C.accentRed, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: C.accentRed, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:10 },
//   stopIcon:   { fontSize: 28 },
//   prompt:     { fontSize: 13, color: C.textMid, marginBottom: 20, textAlign: 'center' },
//   micBtn:     { width: 86, height: 86, borderRadius: 43, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: C.primary, shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:12 },
//   micDisabled:{ backgroundColor: C.border },
//   hint:       { fontSize: 12, color: C.textLight, marginTop: 14 },
//   permBtn:    { backgroundColor: C.primary, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 14 },
//   permBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
//   savedCard:  { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.accentOrange },
//   savedTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 6 },
//   savedDesc:  { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 14 },
//   savedRow:   { flexDirection: 'row', gap: 10 },
//   retryBtn:   { flex: 1, backgroundColor: C.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
//   retryTxt:   { color: '#fff', fontSize: 13, fontWeight: '700' },
//   textSwitchBtn:{ flex: 1, backgroundColor: C.primaryLight, padding: 12, borderRadius: 12, alignItems: 'center' },
//   textSwitchTxt:{ color: C.primary, fontSize: 13, fontWeight: '700' },
//   loadCard:   { alignItems: 'center', padding: 30, marginBottom: 12 },
//   loadTxt:    { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
//   loadSub:    { marginTop: 4, fontSize: 12, color: C.textLight },
//   resultHero: { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset:{width:0,height:3}, shadowOpacity:0.08, shadowRadius:10 },
//   resultEmo:  { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 4 },
//   resultConf: { fontSize: 13, color: C.textMid },
//   card:       { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8 },
//   cardLbl:    { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
//   wRow:       { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
//   wBig:       { fontSize: 40, fontWeight: '700' },
//   wOf:        { fontSize: 20, color: C.textLight },
//   wTag:       { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
//   wTagTxt:    { fontSize: 12, fontWeight: '600' },
//   bar:        { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
//   barFill:    { height: '100%', borderRadius: 4 },
//   interp:     { fontSize: 14, color: C.textMid, lineHeight: 22 },
//   probRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   probLbl:    { width: 120, fontSize: 12, color: C.text },
//   probWrap:   { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
//   probFill:   { height: '100%', borderRadius: 4 },
//   probPct:    { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
//   resetBtn:   { backgroundColor: C.primary, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 10, elevation: 2 },
//   resetTxt:   { color: '#fff', fontSize: 15, fontWeight: '700' },
//   tips:       { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
//   tipsTitle:  { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
//   tip:        { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
// });

// src/screens/AudioAnalysisScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, StatusBar,
} from 'react-native';
import { Audio } from 'expo-av';
import { analyzeAudio, formatEmotion } from '../services/audioApi';
import { saveMoodEntry } from '../utils/moodStorage';
import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
import CrisisAlert from '../components/CrisisAlert';
import { C, getEmotionIcon, getWellnessColor, getWellnessLabel } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const checkOnline = async () => {
  try {
    const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
    return res.status === 204;
  } catch { return false; }
};

export default function AudioAnalysisScreen({ navigation }) {
  const [recording, setRecording]               = useState(null);
  const [isRecording, setIsRecording]           = useState(false);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [analysisResult, setAnalysisResult]     = useState(null);
  const [permissionGranted, setPermission]      = useState(false);
  const [showCrisisAlert, setShowCrisis]        = useState(false);
  const [isOffline, setIsOffline]               = useState(false);
  const [pendingCount, setPendingCount]         = useState(0);
  const [isSyncing, setIsSyncing]               = useState(false);
  const [savedUri, setSavedUri]                 = useState(null);

  const durationRef   = useRef(null);
  const isSyncingRef  = useRef(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    requestPermissions();
    checkStatus();
    const interval = setInterval(async () => {
      const online = await checkOnline();
      setIsOffline(!online);
      if (online) {
        if (wasOfflineRef.current || !isSyncingRef.current) syncQueue();
        wasOfflineRef.current = false;
      } else { wasOfflineRef.current = true; }
    }, 10000);
    return () => {
      clearInterval(interval);
      if (recording) recording.stopAndUnloadAsync();
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  const checkStatus = async () => {
    const online = await checkOnline();
    setIsOffline(!online); wasOfflineRef.current = !online;
    const count = await getQueueCount('audio');
    setPendingCount(count);
    if (online && count > 0) syncQueue();
  };

  const syncQueue = async () => {
    if (isSyncingRef.current) return;
    const count = await getQueueCount('audio');
    if (!count) return;
    isSyncingRef.current = true; setIsSyncing(true);
    try {
      const done = await processQueue();
      if (done > 0) Alert.alert('Synced', `${done} saved recording(s) analysed.`);
      setPendingCount(await getQueueCount('audio'));
    } catch (e) { console.error('syncQueue error:', e); }
    finally { isSyncingRef.current = false; setIsSyncing(false); }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermission(status === 'granted');
      if (status !== 'granted') Alert.alert('Permission Required', 'MindCare needs microphone access.');
    } catch (e) { Alert.alert('Error', `Permission check failed: ${e.message}`); }
  };

  const startRecording = async () => {
    if (!permissionGranted) { await requestPermissions(); return; }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec); setIsRecording(true); setRecordingDuration(0);
      setAnalysisResult(null); setSavedUri(null); setShowCrisis(false);
      durationRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (e) { Alert.alert('Recording Error', `Could not start: ${e.message}`); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    if (durationRef.current) { clearInterval(durationRef.current); durationRef.current = null; }
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false); setRecording(null);
      if (uri) await handleRecordingDone(uri);
      else Alert.alert('Error', 'Could not get recording. Please try again.');
    } catch (e) { Alert.alert('Error', `Stop failed: ${e.message}`); }
  };

  const handleRecordingDone = async (uri) => {
    const online = await checkOnline();
    setIsOffline(!online);
    if (online) { await runAnalysis(uri); }
    else {
      setSavedUri(uri);
      Alert.alert('No Internet', 'Choose what to do:', [
        { text: 'Save for Later', onPress: async () => {
          const permUri = await copyToPermStorage(uri, 'audio');
          await addToQueue({ type: 'audio', uri: permUri });
          setPendingCount(await getQueueCount('audio'));
          Alert.alert('Saved', 'Will be automatically analysed when you reconnect.');
        }},
        { text: 'Switch to Text', onPress: () => navigation.navigate('TextAnalysis') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const runAnalysis = async (uri) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAudio(uri);
      if (result.status === 'success') {
        setAnalysisResult(result.data);
        await saveMoodEntry(result.data, { hasAudio: true });
        if (result.data.wellness_score <= 3.0) setShowCrisis(true);
      } else throw new Error('failed');
    } catch {
      Alert.alert('Analysis Failed', "Save it for when you're back online?", [
        { text: 'Save for Later', onPress: async () => {
          const permUri = await copyToPermStorage(uri, 'audio');
          await addToQueue({ type: 'audio', uri: permUri });
          setPendingCount(await getQueueCount('audio'));
          Alert.alert('Saved', 'Will auto-analyse when connection is restored.');
        }},
        { text: 'Dismiss', style: 'cancel' },
      ]);
    } finally { setIsAnalyzing(false); }
  };

  const retryNow = async () => {
    if (!savedUri) return;
    const online = await checkOnline();
    if (!online) { Alert.alert('Still Offline', 'No internet yet. Recording is saved safely.'); return; }
    setIsOffline(false);
    const uri = savedUri; setSavedUri(null);
    await runAnalysis(uri);
  };

  const resetScreen = () => { setAnalysisResult(null); setRecordingDuration(0); setSavedUri(null); setShowCrisis(false); };
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>

        <View style={st.header}>
          <View style={st.decor} />
          <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={st.backTxt}> Back</Text>
          </TouchableOpacity>
          <Text style={st.headerTitle}>Voice Analysis</Text>
          <Text style={st.headerSub}>Speak naturally for 5–10 seconds</Text>
        </View>

        {isOffline && (
          <View style={st.offlineBanner}>
            <Icon name="wifi-off" size={16} color="#fff" />
            <Text style={st.bannerTxt}> Offline — recordings saved, auto-analysed on reconnect</Text>
          </View>
        )}
        {pendingCount > 0 && !isOffline && (
          <TouchableOpacity style={st.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
            {isSyncing
              ? <View style={st.syncRow}><ActivityIndicator size="small" color="#fff" /><Text style={st.syncTxt}>  Analysing {pendingCount} saved recording(s)…</Text></View>
              : <View style={st.syncRow}><Icon name="cloud-sync" size={16} color="#fff" /><Text style={st.syncTxt}>  {pendingCount} saved recording(s) — Tap to analyse</Text></View>}
          </TouchableOpacity>
        )}

        <View style={st.body}>
          {/* Recorder card */}
          <View style={st.recCard}>
            {isRecording ? (
              <>
                <View style={st.waveRow}>
                  {[8,18,12,28,10,24,14,30,10,22,16,20,8].map((h, i) => (
                    <View key={i} style={[st.wave, { height: h }]} />
                  ))}
                </View>
                <Text style={st.timerTxt}>{fmt(recordingDuration)}</Text>
                <TouchableOpacity style={st.stopBtn} onPress={stopRecording} activeOpacity={0.85}>
                  <Icon name="stop-circle-outline" size={32} color="#fff" />
                </TouchableOpacity>
                <Text style={st.hint}>Tap to stop & analyse</Text>
              </>
            ) : (
              <>
                <Text style={st.prompt}>{permissionGranted ? 'Ready to record' : 'Microphone permission required'}</Text>
                <TouchableOpacity
                  style={[st.micBtn, !permissionGranted && st.micDisabled]}
                  onPress={startRecording} disabled={!permissionGranted} activeOpacity={0.85}
                >
                  <Icon name="microphone" size={40} color="#fff" />
                </TouchableOpacity>
                <Text style={st.hint}>{permissionGranted ? 'Tap to Record' : 'Grant permission below'}</Text>
              </>
            )}
          </View>

          {!permissionGranted && (
            <TouchableOpacity style={st.permBtn} onPress={requestPermissions} activeOpacity={0.85}>
              <Icon name="microphone" size={16} color="#fff" />
              <Text style={st.permBtnTxt}> Grant Microphone Permission</Text>
            </TouchableOpacity>
          )}

          {savedUri && !isAnalyzing && !analysisResult && (
            <View style={st.savedCard}>
              <View style={st.savedTitle}>
                <Icon name="content-save" size={16} color={C.accentOrange} />
                <Text style={st.savedTitleTxt}> Recording Saved Locally</Text>
              </View>
              <Text style={st.savedDesc}>Reconnect to analyse, or use Text Analysis instead.</Text>
              <View style={st.savedRow}>
                <TouchableOpacity style={st.retryBtn} onPress={retryNow} activeOpacity={0.85}>
                  <Icon name="refresh" size={14} color="#fff" />
                  <Text style={st.retryTxt}> Retry Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.textSwitchBtn} onPress={() => navigation.navigate('TextAnalysis')} activeOpacity={0.85}>
                  <Icon name="text-box-edit-outline" size={14} color={C.primary} />
                  <Text style={st.textSwitchTxt}> Use Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isAnalyzing && (
            <View style={st.loadCard}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={st.loadTxt}>Analysing your voice…</Text>
              <Text style={st.loadSub}>This may take a few seconds</Text>
            </View>
          )}

          {analysisResult && !isAnalyzing && (() => {
            const { emotion, wellness_score, interpretation } = analysisResult;
            const wc = getWellnessColor(wellness_score);
            return (
              <>
                <View style={[st.resultHero, { borderTopColor: wc }]}>
                  <Icon name={getEmotionIcon(emotion.primary)} size={56} color={wc} />
                  <Text style={st.resultEmo}>{emotion.primary?.charAt(0).toUpperCase() + emotion.primary?.slice(1)}</Text>
                  <Text style={st.resultConf}>{(emotion.confidence * 100).toFixed(1)}% confidence</Text>
                </View>
                <View style={st.card}>
                  <Text style={st.cardLbl}>Wellness Score</Text>
                  <View style={st.wRow}>
                    <Text style={[st.wBig, { color: wc }]}>{wellness_score.toFixed(1)}</Text>
                    <Text style={st.wOf}>/10</Text>
                    <View style={[st.wTag, { borderColor: wc }]}><Text style={[st.wTagTxt, { color: wc }]}>{getWellnessLabel(wellness_score)}</Text></View>
                  </View>
                  <View style={st.bar}><View style={[st.barFill, { width: `${(wellness_score / 10) * 100}%`, backgroundColor: wc }]} /></View>
                </View>
                <View style={st.card}>
                  <View style={st.cardLabelRow}>
                    <Icon name="comment-text-outline" size={14} color={C.textMid} />
                    <Text style={st.cardLbl}> Interpretation</Text>
                  </View>
                  <Text style={st.interp}>{interpretation}</Text>
                </View>
                <View style={st.card}>
                  <Text style={st.cardLbl}>All Detected Emotions</Text>
                  {Object.entries(emotion.all_probabilities || {}).sort((a,b)=>b[1]-a[1]).map(([emo, prob]) => (
                    <View key={emo} style={st.probRow}>
                      <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
                      <Text style={st.probLbl}>  {emo.charAt(0).toUpperCase()+emo.slice(1)}</Text>
                      <View style={st.probWrap}><View style={[st.probFill, { width: `${prob*100}%`, backgroundColor: C.primary }]} /></View>
                      <Text style={[st.probPct, { color: C.primary }]}>{(prob*100).toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={st.resetBtn} onPress={resetScreen} activeOpacity={0.85}>
                  <Icon name="microphone" size={18} color="#fff" />
                  <Text style={st.resetTxt}> Record Again</Text>
                </TouchableOpacity>
              </>
            );
          })()}

          {!analysisResult && !isAnalyzing && (
            <View style={st.tips}>
              <View style={st.tipsTitle}>
                <Icon name="lightbulb-outline" size={14} color={C.text} />
                <Text style={st.tipsTitleTxt}> Tips</Text>
              </View>
              <Text style={st.tip}>• Speak naturally for 5–10 seconds</Text>
              <Text style={st.tip}>• Find a quiet environment</Text>
              <Text style={st.tip}>• Recordings are saved if you go offline</Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
      <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  scroll:       { flex: 1 },
  header:       { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:        { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backTxt:      { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:  { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:    { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  offlineBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentOrange, padding: 12, paddingHorizontal: 16 },
  bannerTxt:    { color: '#fff', fontSize: 12, fontWeight: '600' },
  syncBanner:   { backgroundColor: C.primaryDark, padding: 12, paddingHorizontal: 16 },
  syncRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  syncTxt:      { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  body:         { padding: 16 },
  recCard:      { backgroundColor: C.card, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  waveRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 16 },
  wave:         { width: 4, borderRadius: 2, backgroundColor: C.accentRed },
  timerTxt:     { fontSize: 34, fontWeight: '700', color: C.accentRed, marginBottom: 18 },
  stopBtn:      { width: 76, height: 76, borderRadius: 38, backgroundColor: C.accentRed, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: C.accentRed, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  prompt:       { fontSize: 13, color: C.textMid, marginBottom: 20, textAlign: 'center' },
  micBtn:       { width: 86, height: 86, borderRadius: 43, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
  micDisabled:  { backgroundColor: C.border },
  hint:         { fontSize: 12, color: C.textLight, marginTop: 14 },
  permBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 14, marginBottom: 14 },
  permBtnTxt:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  savedCard:    { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.accentOrange },
  savedTitle:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  savedTitleTxt:{ fontSize: 14, fontWeight: '700', color: C.text },
  savedDesc:    { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 14 },
  savedRow:     { flexDirection: 'row', gap: 10 },
  retryBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, padding: 12, borderRadius: 12 },
  retryTxt:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  textSwitchBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight, padding: 12, borderRadius: 12 },
  textSwitchTxt:{ color: C.primary, fontSize: 13, fontWeight: '700' },
  loadCard:     { alignItems: 'center', padding: 30, marginBottom: 12 },
  loadTxt:      { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
  loadSub:      { marginTop: 4, fontSize: 12, color: C.textLight },
  resultHero:   { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, gap: 6 },
  resultEmo:    { fontSize: 26, fontWeight: '700', color: C.text },
  resultConf:   { fontSize: 13, color: C.textMid },
  card:         { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardLbl:      { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
  wRow:         { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
  wBig:         { fontSize: 40, fontWeight: '700' },
  wOf:          { fontSize: 20, color: C.textLight },
  wTag:         { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  wTagTxt:      { fontSize: 12, fontWeight: '600' },
  bar:          { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 4 },
  interp:       { fontSize: 14, color: C.textMid, lineHeight: 22 },
  probRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  probLbl:      { fontSize: 12, color: C.text, width: 100 },
  probWrap:     { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probFill:     { height: '100%', borderRadius: 4 },
  probPct:      { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  resetBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 15, marginBottom: 10, elevation: 2 },
  resetTxt:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  tips:         { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
  tipsTitle:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipsTitleTxt: { fontSize: 13, fontWeight: '700', color: C.text },
  tip:          { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
});