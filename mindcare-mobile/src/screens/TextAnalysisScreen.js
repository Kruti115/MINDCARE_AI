// // // src/screens/TextAnalysisScreen.js - WITH EMOTION DISTRIBUTION CHART
// // import React, { useState } from 'react';
// // import {
// //   View, Text, TextInput, TouchableOpacity,
// //   StyleSheet, Alert, ActivityIndicator, ScrollView
// // } from 'react-native';
// // import { analyzeText, isOnline } from '../services/api';
// // import { analyzeTextOffline } from '../services/offlineAnalysis';
// // import { saveMoodEntry } from '../utils/moodStorage';
// // import CrisisAlert from '../components/CrisisAlert';

// // // ─── EMOTION CONFIG ────────────────────────────────────────────────────────
// // const EMOTION_EMOJIS = {
// //   happy: '😊', joy: '😊', sad: '😢', sadness: '😢',
// //   angry: '😠', anger: '😠', fear: '😰', fearful: '😰',
// //   disgust: '🤢', surprise: '😲', neutral: '😐', calm: '😌', unknown: '🤔'
// // };

// // const EMOTION_COLORS = {
// //   happy: '#4CAF50', joy: '#4CAF50',
// //   sad: '#2196F3', sadness: '#2196F3',
// //   angry: '#F44336', anger: '#F44336',
// //   fear: '#FF9800', fearful: '#FF9800',
// //   disgust: '#9C27B0',
// //   surprise: '#00BCD4',
// //   neutral: '#9E9E9E', calm: '#9E9E9E',
// //   unknown: '#9E9E9E',
// // };

// // const EMOTION_OPTIONS = ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise', 'neutral'];

// // const getEmotionEmoji = (e) => EMOTION_EMOJIS[e?.toLowerCase()] || '🤔';
// // const getEmotionColor = (e) => EMOTION_COLORS[e?.toLowerCase()] || '#9E9E9E';

// // const getWellnessColor = (score) => {
// //   if (score >= 7) return '#4CAF50';
// //   if (score >= 4) return '#FFC107';
// //   return '#F44336';
// // };

// // const EMOTION_WELLNESS = {
// //   happy: 8.0, joy: 8.0,
// //   neutral: 5.0, calm: 6.5, surprise: 5.5,
// //   sad: 3.5, sadness: 3.5,
// //   fear: 2.5, fearful: 2.5,
// //   angry: 2.5, anger: 2.5,
// //   disgust: 2.0,
// //   unknown: 5.0,
// // };

// // // ─── EMOTION DISTRIBUTION CHART ───────────────────────────────────────────
// // function EmotionDistributionChart({ emotions }) {
// //   if (!emotions || Object.keys(emotions).length === 0) return null;

// //   const sorted = Object.entries(emotions)
// //     .sort(([, a], [, b]) => b - a)
// //     .slice(0, 6);

// //   const maxVal = sorted[0]?.[1] || 1;

// //   return (
// //     <View style={chartStyles.container}>
// //       <Text style={chartStyles.title}>Emotion Distribution</Text>
// //       {sorted.map(([emotion, score]) => {
// //         const pct = Math.round((score / maxVal) * 100);
// //         const color = getEmotionColor(emotion);
// //         return (
// //           <View key={emotion} style={chartStyles.row}>
// //             <Text style={chartStyles.label}>
// //               {getEmotionEmoji(emotion)} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
// //             </Text>
// //             <View style={chartStyles.barTrack}>
// //               <View style={[chartStyles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
// //             </View>
// //             <Text style={[chartStyles.pct, { color }]}>
// //               {(score * 100).toFixed(1)}%
// //             </Text>
// //           </View>
// //         );
// //       })}
// //     </View>
// //   );
// // }

// // const chartStyles = StyleSheet.create({
// //   container: {
// //     backgroundColor: 'white',
// //     borderRadius: 16,
// //     padding: 18,
// //     marginBottom: 12,
// //     elevation: 3,
// //   },
// //   title: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: '#333',
// //     marginBottom: 14,
// //   },
// //   row: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //   },
// //   label: {
// //     width: 110,
// //     fontSize: 13,
// //     color: '#444',
// //     fontWeight: '500',
// //   },
// //   barTrack: {
// //     flex: 1,
// //     height: 10,
// //     backgroundColor: '#F0F0F0',
// //     borderRadius: 5,
// //     overflow: 'hidden',
// //     marginHorizontal: 8,
// //   },
// //   barFill: {
// //     height: '100%',
// //     borderRadius: 5,
// //   },
// //   pct: {
// //     width: 48,
// //     fontSize: 12,
// //     fontWeight: '600',
// //     textAlign: 'right',
// //   },
// // });

// // // ─── MAIN SCREEN ──────────────────────────────────────────────────────────
// // export default function TextAnalysisScreen({ navigation }) {
// //   const [text, setText] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [result, setResult] = useState(null);
// //   const [showCrisisAlert, setShowCrisisAlert] = useState(false);
// //   const [correctionMode, setCorrectionMode] = useState(false);
// //   const [correctedEmotion, setCorrectedEmotion] = useState(null);

// //   const handleAnalyze = async () => {
// //     if (!text.trim()) {
// //       Alert.alert('Error', 'Please enter some text to analyze.');
// //       return;
// //     }

// //     setLoading(true);
// //     setResult(null);
// //     setCorrectionMode(false);
// //     setCorrectedEmotion(null);
// //     setShowCrisisAlert(false);

// //     try {
// //       const online = await isOnline();
// //       let analysisResult;

// //       if (online) {
// //         analysisResult = await analyzeText(text);
// //         console.log('Online analysis completed');
// //       } else {
// //         analysisResult = analyzeTextOffline(text);
// //         console.log('Offline mode used');
// //       }

// //       if (analysisResult?.data) {
// //         setResult(analysisResult);
// //         await saveMoodEntry(analysisResult.data, { inputText: text });

// //         if (analysisResult.data.wellness_score <= 3.0) {
// //           setShowCrisisAlert(true);
// //         }
// //       } else {
// //         Alert.alert('Error', 'Analysis returned no data. Please try again.');
// //       }

// //     } catch (error) {
// //       console.log('⚠️ Error, falling back to offline:', error);
// //       try {
// //         const offlineResult = analyzeTextOffline(text);
// //         setResult(offlineResult);
// //         if (offlineResult?.data) {
// //           await saveMoodEntry(offlineResult.data, { inputText: text });

// //           if (offlineResult.data.wellness_score <= 3.0) {
// //           setShowCrisisAlert(true);
// //         } 
// //         }
// //       } catch {
// //         Alert.alert('Error', 'Analysis failed. Please try again.');
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const applyCorrection = async (emotion) => {
// //     if (!result?.data) return;
// //     setCorrectedEmotion(emotion);
// //     setCorrectionMode(false);

// //     const correctedWellness = EMOTION_WELLNESS[emotion] ?? 5.0;
// //     const correctedResult = {
// //       ...result,
// //       data: {
// //         ...result.data,
// //         emotion: { ...result.data.emotion, primary: emotion, confidence: 1.0 },
// //         wellness_score: correctedWellness,
// //         interpretation: `User-corrected emotion: ${emotion}. Wellness adjusted accordingly.`,
// //       },
// //     };
// //     setResult(correctedResult);
// //     await saveMoodEntry(correctedResult.data);

// //     if (correctedWellness <= 3.0) setShowCrisisAlert(true);
// //     else setShowCrisisAlert(false);
// //   };

// //   const resetScreen = () => {
// //     setText('');
// //     setResult(null);
// //     setCorrectionMode(false);
// //     setCorrectedEmotion(null);
// //     setShowCrisisAlert(false);
// //   };

// //   const displayEmotion = result?.data?.emotion?.primary || 'unknown';
// //   const displayWellness = result?.data?.wellness_score ?? 5.0;

// //   // Reads all_probabilities from your backend response
// //   const emotionDistribution = result?.data?.emotion?.all_probabilities || null;

// //   return (
// //     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

// //       {/* ── HEADER ── */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //           <Text style={styles.backButtonText}>← Back</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>Text Analysis</Text>
// //         <Text style={styles.headerSubtitle}>Analyze emotions from your words</Text>
// //       </View>

// //       <View style={styles.body}>

// //         {/* ── INPUT ── */}
// //         <TextInput
// //           style={styles.input}
// //           placeholder="How are you feeling today? Describe your thoughts honestly..."
// //           placeholderTextColor="#999"
// //           multiline
// //           numberOfLines={6}
// //           value={text}
// //           onChangeText={setText}
// //           editable={!loading}
// //         />

// //         <TouchableOpacity
// //           style={[styles.analyzeButton, loading && styles.buttonDisabled]}
// //           onPress={handleAnalyze}
// //           disabled={loading}
// //         >
// //           {loading ? (
// //             <View style={styles.loadingRow}>
// //               <ActivityIndicator color="#fff" />
// //               <Text style={styles.loadingText}>Analyzing...</Text>
// //             </View>
// //           ) : (
// //             <Text style={styles.analyzeButtonText}>Analyze Emotion</Text>
// //           )}
// //         </TouchableOpacity>

// //         {/* ── RESULTS ── */}
// //         {result && result.data && (
// //           <View style={styles.resultsContainer}>
// //             <Text style={styles.resultsTitle}>Analysis Results</Text>

// //             {/* Emotion Card */}
// //             <View style={styles.emotionCard}>
// //               <Text style={styles.emotionEmoji}>{getEmotionEmoji(displayEmotion)}</Text>
// //               <Text style={styles.emotionLabel}>Primary Emotion</Text>
// //               <Text style={[styles.emotionValue, { color: getEmotionColor(displayEmotion) }]}>
// //                 {displayEmotion.toUpperCase()}
// //               </Text>
// //               <Text style={styles.confidenceText}>
// //                 Confidence: {(result.data.emotion.confidence * 100).toFixed(1)}%
// //                 {correctedEmotion ? '  Corrected' : ''}
// //               </Text>
// //             </View>

// //             {/* Wellness Score */}
// //             <View style={styles.wellnessCard}>
// //               <Text style={styles.wellnessLabel}>Wellness Score</Text>
// //               <Text style={[styles.wellnessScore, { color: getWellnessColor(displayWellness) }]}>
// //                 {displayWellness.toFixed(1)}/10
// //               </Text>
// //               <View style={styles.wellnessBar}>
// //                 <View style={[styles.wellnessFill, {
// //                   width: `${(displayWellness / 10) * 100}%`,
// //                   backgroundColor: getWellnessColor(displayWellness),
// //                 }]} />
// //               </View>
// //             </View>

// //             {/* ── EMOTION DISTRIBUTION CHART ── */}
// //             <EmotionDistributionChart emotions={emotionDistribution} />

// //             {/* Interpretation */}
// //             <View style={styles.interpretationCard}>
// //               <Text style={styles.interpretationLabel}>Interpretation</Text>
// //               <Text style={styles.interpretationText}>{result.data.interpretation}</Text>
// //             </View>

// //             {/* Correction */}
// //             {!correctionMode ? (
// //               <TouchableOpacity
// //                 style={styles.correctButton}
// //                 onPress={() => setCorrectionMode(true)}
// //               >
// //                 <Text style={styles.correctButtonText}>Does this seem wrong? Correct it</Text>
// //               </TouchableOpacity>
// //             ) : (
// //               <View style={styles.correctionPanel}>
// //                 <Text style={styles.correctionTitle}>What did you actually feel?</Text>
// //                 <View style={styles.correctionOptions}>
// //                   {EMOTION_OPTIONS.map(emo => (
// //                     <TouchableOpacity
// //                       key={emo}
// //                       style={[
// //                         styles.correctionChip,
// //                         correctedEmotion === emo && styles.correctionChipSelected,
// //                       ]}
// //                       onPress={() => applyCorrection(emo)}
// //                     >
// //                       <Text style={styles.correctionChipText}>
// //                         {getEmotionEmoji(emo)} {emo}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </View>
// //                 <TouchableOpacity
// //                   style={styles.cancelCorrectionButton}
// //                   onPress={() => setCorrectionMode(false)}
// //                 >
// //                   <Text style={styles.cancelCorrectionText}>Cancel</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             )}

// //             {/* Mode */}
// //             <View style={styles.modeCard}>
// //               <Text style={styles.modeText}>
// //                 {result.data.mode === 'online' ? 'Online Analysis' : 'Offline Analysis'}
// //               </Text>
// //             </View>

// //             {/* Reset */}
// //             <TouchableOpacity style={styles.resetButton} onPress={resetScreen}>
// //               <Text style={styles.resetButtonText}>Analyze Again</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* ── TIP ── */}
// //         <View style={styles.tipBox}>
// //           <Text style={styles.tipTitle}>💡 Tips for better results</Text>
// //           <Text style={styles.tipText}>• Be honest and descriptive in your writing</Text>
// //           <Text style={styles.tipText}>• Write at least 1-2 full sentences</Text>
// //           <Text style={styles.tipText}>• If the result seems wrong, use the correction option</Text>
// //         </View>

// //       </View>

// //       {/* Crisis Alert */}
// //       <CrisisAlert
// //         visible={showCrisisAlert}
// //         onClose={() => setShowCrisisAlert(false)}
// //       />

// //     </ScrollView>
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

// //   body: { padding: 15 },

// //   input: {
// //     minHeight: 140,
// //     borderColor: '#DDD',
// //     borderWidth: 2,
// //     borderRadius: 14,
// //     padding: 14,
// //     fontSize: 15,
// //     textAlignVertical: 'top',
// //     backgroundColor: 'white',
// //     color: '#333',
// //     marginBottom: 14,
// //     elevation: 1,
// //   },
// //   analyzeButton: {
// //     backgroundColor: '#6C63FF',
// //     paddingVertical: 15,
// //     borderRadius: 12,
// //     alignItems: 'center',
// //     elevation: 3,
// //     marginBottom: 20,
// //   },
// //   buttonDisabled: { backgroundColor: '#CCC' },
// //   analyzeButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
// //   loadingRow: { flexDirection: 'row', alignItems: 'center' },
// //   loadingText: { color: 'white', fontSize: 16, marginLeft: 10 },

// //   resultsContainer: { marginBottom: 10 },
// //   resultsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 14 },

// //   emotionCard: {
// //     backgroundColor: 'white', borderRadius: 16, padding: 20,
// //     alignItems: 'center', marginBottom: 12, elevation: 3,
// //   },
// //   emotionEmoji: { fontSize: 52, marginBottom: 8 },
// //   emotionLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
// //   emotionValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
// //   confidenceText: { fontSize: 13, color: '#666' },

// //   wellnessCard: {
// //     backgroundColor: 'white', borderRadius: 16, padding: 20,
// //     alignItems: 'center', marginBottom: 12, elevation: 3,
// //   },
// //   wellnessLabel: { fontSize: 13, color: '#999', marginBottom: 6 },
// //   wellnessScore: { fontSize: 44, fontWeight: 'bold', marginBottom: 10 },
// //   wellnessBar: {
// //     width: '100%', height: 10, backgroundColor: '#F0F0F0',
// //     borderRadius: 5, overflow: 'hidden',
// //   },
// //   wellnessFill: { height: '100%', borderRadius: 5 },

// //   interpretationCard: {
// //     backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, elevation: 3,
// //   },
// //   interpretationLabel: { fontSize: 15, fontWeight: '700', color: '#6C63FF', marginBottom: 8 },
// //   interpretationText: { fontSize: 14, color: '#444', lineHeight: 21 },

// //   correctButton: {
// //     borderWidth: 1.5, borderColor: '#6C63FF', borderRadius: 10,
// //     padding: 12, alignItems: 'center', marginBottom: 12,
// //   },
// //   correctButtonText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },

// //   correctionPanel: {
// //     backgroundColor: 'white', borderRadius: 16, padding: 16,
// //     marginBottom: 12, elevation: 3,
// //   },
// //   correctionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
// //   correctionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
// //   correctionChip: {
// //     borderWidth: 1.5, borderColor: '#DDD', borderRadius: 20,
// //     paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#F8F9FA',
// //   },
// //   correctionChipSelected: { borderColor: '#6C63FF', backgroundColor: '#EDE7F6' },
// //   correctionChipText: { fontSize: 13, color: '#444', fontWeight: '600' },
// //   cancelCorrectionButton: { marginTop: 12, alignItems: 'center' },
// //   cancelCorrectionText: { fontSize: 13, color: '#999' },

// //   modeCard: {
// //     backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12,
// //     alignItems: 'center', marginBottom: 12,
// //   },
// //   modeText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },

// //   resetButton: {
// //     backgroundColor: '#6C63FF', paddingVertical: 14,
// //     borderRadius: 12, alignItems: 'center', marginBottom: 8, elevation: 2,
// //   },
// //   resetButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },

// //   tipBox: {
// //     backgroundColor: 'white', borderRadius: 12, padding: 15,
// //     marginTop: 8, marginBottom: 30, elevation: 2,
// //     borderLeftWidth: 4, borderLeftColor: '#6C63FF',
// //   },
// //   tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   tipText: { fontSize: 13, color: '#666', marginBottom: 3 },
// // });

// // src/screens/TextAnalysisScreen.js
// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   TextInput, ActivityIndicator, StatusBar,
// } from 'react-native';
// import axios from 'axios';
// import { saveMoodEntry } from '../utils/moodStorage';
// import CrisisAlert from '../components/CrisisAlert';
// import { C, getEmoji, getWellnessColor, getWellnessLabel } from '../theme';

// const API_BASE = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// const EMOTION_COLORS = {
//   joy: C.primary, sadness: '#5BB8F5', anger: C.accentRed,
//   anxiety: C.purple, neutral: C.textLight,
// };

// export default function TextAnalysisScreen({ navigation }) {
//   const [text, setText]                     = useState('');
//   const [isAnalyzing, setIsAnalyzing]       = useState(false);
//   const [result, setResult]                 = useState(null);
//   const [showCrisisAlert, setShowCrisis]    = useState(false);
//   const [error, setError]                   = useState('');

//   const analyze = async () => {
//     if (!text.trim() || text.trim().length < 3) return;
//     setIsAnalyzing(true);
//     setResult(null);
//     setError('');
//     try {
//       const res = await axios.post(`${API_BASE}/analyze-text`, { text: text.trim() }, { timeout: 30000 });
//       if (res.data.status === 'success') {
//         setResult(res.data.data);
//         await saveMoodEntry(res.data.data, { inputText: text.trim() });
//         if (res.data.data.wellness_score <= 3.0) setShowCrisis(true);
//       }
//     } catch (e) {
//       setError('Could not reach the server. Please check your connection and try again.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const reset = () => { setText(''); setResult(null); setError(''); };

//   const canAnalyze = text.trim().length >= 3 && !isAnalyzing;

//   return (
//     <View style={styles.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerDecor} />
//           <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//             <Text style={styles.backTxt}>← Back</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Text Analysis</Text>
//           <Text style={styles.headerSub}>Type how you feel — we'll understand</Text>
//         </View>

//         <View style={styles.body}>

//           {/* Input card */}
//           <View style={styles.inputCard}>
//             <Text style={styles.inputLabel}>What's on your mind?</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="I feel… today has been… I'm thinking about…"
//               placeholderTextColor={C.textLight}
//               value={text}
//               onChangeText={v => { setText(v); if (result) setResult(null); }}
//               multiline
//               numberOfLines={5}
//               textAlignVertical="top"
//             />
//             <View style={styles.inputFooter}>
//               <Text style={styles.charCount}>{text.length} chars</Text>
//               <TouchableOpacity
//                 style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
//                 onPress={analyze}
//                 disabled={!canAnalyze}
//                 activeOpacity={0.85}
//               >
//                 {isAnalyzing
//                   ? <ActivityIndicator size="small" color="#fff" />
//                   : <Text style={styles.analyzeBtnTxt}>Analyse →</Text>
//                 }
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Error */}
//           {!!error && (
//             <View style={styles.errorCard}>
//               <Text style={styles.errorTxt}>⚠️  {error}</Text>
//             </View>
//           )}

//           {/* Loading */}
//           {isAnalyzing && (
//             <View style={styles.loadingCard}>
//               <ActivityIndicator size="large" color={C.primary} />
//               <Text style={styles.loadingTxt}>Analysing your text…</Text>
//               <Text style={styles.loadingSub}>This takes a few seconds</Text>
//             </View>
//           )}

//           {/* Results */}
//           {result && !isAnalyzing && (() => {
//             const { emotion, wellness_score, interpretation, context_flags } = result;
//             const wColor = getWellnessColor(wellness_score);
//             const sortedProbs = Object.entries(emotion.all_probabilities || {})
//               .sort((a, b) => b[1] - a[1]);

//             return (
//               <>
//                 {/* Primary emotion hero */}
//                 <View style={[styles.resultHero, { borderTopColor: wColor }]}>
//                   <Text style={styles.resultEmoji}>{getEmoji(emotion.primary)}</Text>
//                   <Text style={styles.resultEmotion}>
//                     {emotion.primary?.charAt(0).toUpperCase() + emotion.primary?.slice(1)}
//                   </Text>
//                   <Text style={styles.resultConf}>
//                     {(emotion.confidence * 100).toFixed(1)}% confidence
//                   </Text>
//                   {context_flags?.sarcasm_detected && (
//                     <View style={styles.contextBadge}>
//                       <Text style={styles.contextBadgeTxt}>Sarcasm detected</Text>
//                     </View>
//                   )}
//                   {context_flags?.pain_signals && (
//                     <View style={[styles.contextBadge, { backgroundColor: '#FFF0EE' }]}>
//                       <Text style={[styles.contextBadgeTxt, { color: C.accentRed }]}>Distress signals</Text>
//                     </View>
//                   )}
//                 </View>

//                 {/* Wellness score */}
//                 <View style={styles.card}>
//                   <Text style={styles.cardLabel}>Wellness Score</Text>
//                   <View style={styles.wellnessRow}>
//                     <Text style={[styles.wellnessBig, { color: wColor }]}>{wellness_score.toFixed(1)}</Text>
//                     <Text style={styles.wellnessOf}>/10</Text>
//                     <View style={styles.wellnessTag}>
//                       <Text style={[styles.wellnessTagTxt, { color: wColor }]}>{getWellnessLabel(wellness_score)}</Text>
//                     </View>
//                   </View>
//                   <View style={styles.bar}>
//                     <View style={[styles.barFill, { width: `${(wellness_score / 10) * 100}%`, backgroundColor: wColor }]} />
//                   </View>
//                 </View>

//                 {/* Interpretation */}
//                 <View style={styles.card}>
//                   <Text style={styles.cardLabel}>💭  Interpretation</Text>
//                   <Text style={styles.interpretTxt}>{interpretation}</Text>
//                 </View>

//                 {/* Emotion breakdown */}
//                 <View style={styles.card}>
//                   <Text style={styles.cardLabel}>Emotion Breakdown</Text>
//                   {sortedProbs.map(([emo, prob]) => {
//                     const eColor = EMOTION_COLORS[emo] || C.textLight;
//                     return (
//                       <View key={emo} style={styles.probRow}>
//                         <Text style={styles.probLabel}>
//                           {getEmoji(emo)}  {emo.charAt(0).toUpperCase() + emo.slice(1)}
//                         </Text>
//                         <View style={styles.probBarWrap}>
//                           <View style={[styles.probBar, { width: `${prob * 100}%`, backgroundColor: eColor }]} />
//                         </View>
//                         <Text style={[styles.probPct, { color: eColor }]}>{(prob * 100).toFixed(0)}%</Text>
//                       </View>
//                     );
//                   })}
//                 </View>

//                 <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
//                   <Text style={styles.resetBtnTxt}>Analyse Another</Text>
//                 </TouchableOpacity>
//               </>
//             );
//           })()}

//           {/* Tips */}
//           {!result && !isAnalyzing && (
//             <View style={styles.tipsCard}>
//               <Text style={styles.tipsTitle}>💡  Tips for best results</Text>
//               <Text style={styles.tipsTxt}>• Write at least 10 words for better accuracy</Text>
//               <Text style={styles.tipsTxt}>• Be honest — this is private to you</Text>
//               <Text style={styles.tipsTxt}>• Include context like what happened today</Text>
//             </View>
//           )}

//           <View style={{ height: 32 }} />
//         </View>
//       </ScrollView>
//       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root:            { flex: 1, backgroundColor: C.bg },
//   scroll:          { flex: 1 },

//   // Header
//   header:          { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   headerDecor:     { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:         { marginBottom: 10 },
//   backTxt:         { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:     { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:       { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

//   body:            { padding: 16 },

//   // Input
//   inputCard:       { backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, marginBottom: 14 },
//   inputLabel:      { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 10 },
//   input:           { fontSize: 14, color: C.text, lineHeight: 22, minHeight: 110, fontFamily: undefined },
//   inputFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
//   charCount:       { fontSize: 11, color: C.textLight },
//   analyzeBtn:      { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, minWidth: 100, alignItems: 'center' },
//   analyzeBtnDisabled: { backgroundColor: C.border },
//   analyzeBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '700' },

//   // Error
//   errorCard:       { backgroundColor: '#FFF0EE', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FFD0CA' },
//   errorTxt:        { color: C.accentRed, fontSize: 13, lineHeight: 20 },

//   // Loading
//   loadingCard:     { alignItems: 'center', padding: 30, marginBottom: 12 },
//   loadingTxt:      { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
//   loadingSub:      { marginTop: 4, fontSize: 12, color: C.textLight },

//   // Result hero
//   resultHero:      { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
//   resultEmoji:     { fontSize: 52, marginBottom: 8 },
//   resultEmotion:   { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 4 },
//   resultConf:      { fontSize: 13, color: C.textMid, marginBottom: 8 },
//   contextBadge:    { backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
//   contextBadgeTxt: { fontSize: 11, color: C.primary, fontWeight: '600' },

//   // Card
//   card:            { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
//   cardLabel:       { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },

//   // Wellness
//   wellnessRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
//   wellnessBig:     { fontSize: 40, fontWeight: '700' },
//   wellnessOf:      { fontSize: 20, color: C.textLight },
//   wellnessTag:     { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
//   wellnessTagTxt:  { fontSize: 12, fontWeight: '600' },
//   bar:             { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
//   barFill:         { height: '100%', borderRadius: 4 },

//   interpretTxt:    { fontSize: 14, color: C.textMid, lineHeight: 22 },

//   // Prob bars
//   probRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   probLabel:       { width: 110, fontSize: 12, color: C.text },
//   probBarWrap:     { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
//   probBar:         { height: '100%', borderRadius: 4 },
//   probPct:         { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },

//   // Reset
//   resetBtn:        { backgroundColor: C.primary, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 10, elevation: 2 },
//   resetBtnTxt:     { color: '#fff', fontSize: 15, fontWeight: '700' },

//   // Tips
//   tipsCard:        { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
//   tipsTitle:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
//   tipsTxt:         { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
// });

// src/screens/TextAnalysisScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar,
} from 'react-native';
import axios from 'axios';
import { saveMoodEntry } from '../utils/moodStorage';
import CrisisAlert from '../components/CrisisAlert';
import { C, getEmotionIcon, getWellnessColor, getWellnessLabel } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const API_BASE = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

const EMOTION_COLORS = {
  joy: C.primary, sadness: '#5BB8F5', anger: C.accentRed,
  anxiety: C.purple, neutral: C.textLight,
};

export default function TextAnalysisScreen({ navigation }) {
  const [text, setText]                  = useState('');
  const [isAnalyzing, setIsAnalyzing]    = useState(false);
  const [result, setResult]              = useState(null);
  const [showCrisisAlert, setShowCrisis] = useState(false);
  const [error, setError]                = useState('');

  const analyze = async () => {
    if (!text.trim() || text.trim().length < 3) return;
    setIsAnalyzing(true); setResult(null); setError('');
    try {
      const res = await axios.post(`${API_BASE}/analyze-text`, { text: text.trim() }, { timeout: 30000 });
      if (res.data.status === 'success') {
        setResult(res.data.data);
        await saveMoodEntry(res.data.data, { inputText: text.trim() });
        if (res.data.data.wellness_score <= 3.0) setShowCrisis(true);
      }
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
    } finally { setIsAnalyzing(false); }
  };

  const reset = () => { setText(''); setResult(null); setError(''); };
  const canAnalyze = text.trim().length >= 3 && !isAnalyzing;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View style={s.decor} />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={s.backTxt}> Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Text Analysis</Text>
          <Text style={s.headerSub}>Type how you feel — we'll understand</Text>
        </View>

        <View style={s.body}>
          {/* Input card */}
          <View style={s.inputCard}>
            <Text style={s.inputLabel}>What's on your mind?</Text>
            <TextInput
              style={s.input}
              placeholder="I feel… today has been… I'm thinking about…"
              placeholderTextColor={C.textLight}
              value={text}
              onChangeText={v => { setText(v); if (result) setResult(null); }}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <View style={s.inputFooter}>
              <Text style={s.charCount}>{text.length} chars</Text>
              <TouchableOpacity
                style={[s.analyzeBtn, !canAnalyze && s.analyzeBtnDisabled]}
                onPress={analyze}
                disabled={!canAnalyze}
                activeOpacity={0.85}
              >
                {isAnalyzing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Text style={s.analyzeBtnTxt}>Analyse</Text>
                      <Icon name="send" size={14} color="#fff" />
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={s.errorCard}>
              <Icon name="alert-circle-outline" size={18} color={C.accentRed} />
              <Text style={s.errorTxt}> {error}</Text>
            </View>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <View style={s.loadingCard}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={s.loadingTxt}>Analysing your text…</Text>
              <Text style={s.loadingSub}>This takes a few seconds</Text>
            </View>
          )}

          {/* Results */}
          {result && !isAnalyzing && (() => {
            const { emotion, wellness_score, interpretation, context_flags } = result;
            const wColor = getWellnessColor(wellness_score);
            const sortedProbs = Object.entries(emotion.all_probabilities || {}).sort((a, b) => b[1] - a[1]);
            return (
              <>
                <View style={[s.resultHero, { borderTopColor: wColor }]}>
                  <Icon name={getEmotionIcon(emotion.primary)} size={56} color={wColor} />
                  <Text style={s.resultEmotion}>
                    {emotion.primary?.charAt(0).toUpperCase() + emotion.primary?.slice(1)}
                  </Text>
                  <Text style={s.resultConf}>{(emotion.confidence * 100).toFixed(1)}% confidence</Text>
                  {context_flags?.sarcasm_detected && (
                    <View style={s.contextBadge}>
                      <Icon name="comment-question-outline" size={12} color={C.primary} />
                      <Text style={s.contextBadgeTxt}> Sarcasm detected</Text>
                    </View>
                  )}
                  {context_flags?.pain_signals && (
                    <View style={[s.contextBadge, { backgroundColor: '#FFF0EE' }]}>
                      <Icon name="alert-circle-outline" size={12} color={C.accentRed} />
                      <Text style={[s.contextBadgeTxt, { color: C.accentRed }]}> Distress signals</Text>
                    </View>
                  )}
                </View>

                <View style={s.card}>
                  <Text style={s.cardLabel}>Wellness Score</Text>
                  <View style={s.wellnessRow}>
                    <Text style={[s.wellnessBig, { color: wColor }]}>{wellness_score.toFixed(1)}</Text>
                    <Text style={s.wellnessOf}>/10</Text>
                    <View style={s.wellnessTag}>
                      <Text style={[s.wellnessTagTxt, { color: wColor }]}>{getWellnessLabel(wellness_score)}</Text>
                    </View>
                  </View>
                  <View style={s.bar}><View style={[s.barFill, { width: `${(wellness_score / 10) * 100}%`, backgroundColor: wColor }]} /></View>
                </View>

                <View style={s.card}>
                  <View style={s.cardLabelRow}>
                    <Icon name="comment-text-outline" size={14} color={C.textMid} />
                    <Text style={s.cardLabel}> Interpretation</Text>
                  </View>
                  <Text style={s.interpretTxt}>{interpretation}</Text>
                </View>

                <View style={s.card}>
                  <Text style={s.cardLabel}>Emotion Breakdown</Text>
                  {sortedProbs.map(([emo, prob]) => {
                    const eColor = EMOTION_COLORS[emo] || C.textLight;
                    return (
                      <View key={emo} style={s.probRow}>
                        <Icon name={getEmotionIcon(emo)} size={16} color={eColor} />
                        <Text style={s.probLabel}>  {emo.charAt(0).toUpperCase() + emo.slice(1)}</Text>
                        <View style={s.probBarWrap}>
                          <View style={[s.probBar, { width: `${prob * 100}%`, backgroundColor: eColor }]} />
                        </View>
                        <Text style={[s.probPct, { color: eColor }]}>{(prob * 100).toFixed(0)}%</Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.85}>
                  <Icon name="text-box-edit-outline" size={18} color="#fff" />
                  <Text style={s.resetBtnTxt}>  Analyse Another</Text>
                </TouchableOpacity>
              </>
            );
          })()}

          {/* Tips */}
          {!result && !isAnalyzing && (
            <View style={s.tipsCard}>
              <View style={s.tipsTitle}>
                <Icon name="lightbulb-outline" size={15} color={C.text} />
                <Text style={s.tipsTitleTxt}>  Tips for best results</Text>
              </View>
              <Text style={s.tipsTxt}>• Write at least 10 words for better accuracy</Text>
              <Text style={s.tipsTxt}>• Be honest — this is private to you</Text>
              <Text style={s.tipsTxt}>• Include context like what happened today</Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
      <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  scroll:          { flex: 1 },
  header:          { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:           { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backTxt:         { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:     { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:       { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  body:            { padding: 16 },
  inputCard:       { backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, marginBottom: 14 },
  inputLabel:      { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 10 },
  input:           { fontSize: 14, color: C.text, lineHeight: 22, minHeight: 110 },
  inputFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  charCount:       { fontSize: 11, color: C.textLight },
  analyzeBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  analyzeBtnDisabled: { backgroundColor: C.border },
  analyzeBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  errorCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0EE', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FFD0CA' },
  errorTxt:        { color: C.accentRed, fontSize: 13, lineHeight: 20, flex: 1 },
  loadingCard:     { alignItems: 'center', padding: 30, marginBottom: 12 },
  loadingTxt:      { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
  loadingSub:      { marginTop: 4, fontSize: 12, color: C.textLight },
  resultHero:      { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, gap: 6 },
  resultEmotion:   { fontSize: 26, fontWeight: '700', color: C.text },
  resultConf:      { fontSize: 13, color: C.textMid },
  contextBadge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 2 },
  contextBadgeTxt: { fontSize: 11, color: C.primary, fontWeight: '600' },
  card:            { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardLabelRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardLabel:       { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
  wellnessRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
  wellnessBig:     { fontSize: 40, fontWeight: '700' },
  wellnessOf:      { fontSize: 20, color: C.textLight },
  wellnessTag:     { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  wellnessTagTxt:  { fontSize: 12, fontWeight: '600' },
  bar:             { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 4 },
  interpretTxt:    { fontSize: 14, color: C.textMid, lineHeight: 22 },
  probRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  probLabel:       { fontSize: 12, color: C.text, width: 90 },
  probBarWrap:     { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probBar:         { height: '100%', borderRadius: 4 },
  probPct:         { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  resetBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 15, marginBottom: 10, elevation: 2 },
  resetBtnTxt:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  tipsCard:        { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
  tipsTitle:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipsTitleTxt:    { fontSize: 13, fontWeight: '700', color: C.text },
  tipsTxt:         { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
});