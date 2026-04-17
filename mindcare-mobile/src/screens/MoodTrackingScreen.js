// // // src/screens/MoodTrackingScreen.js - FIXED 7-DAY CHART + PERSISTENT STORAGE
// // import React, { useState, useEffect } from 'react';
// // import {
// //   View, Text, StyleSheet, ScrollView, TouchableOpacity,
// //   Dimensions, Image, Alert
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { LineChart } from 'react-native-chart-kit';
// // import CrisisAlert from '../components/CrisisAlert';

// // const SCREEN_W = Dimensions.get('window').width;

// // const getEmotionEmoji = (emotion) => {
// //   const map = {
// //     happy: '😊', joy: '😊', sad: '😢', sadness: '😢',
// //     angry: '😠', anger: '😠', fearful: '😰', fear: '😰',
// //     disgust: '🤢', surprise: '😲', surprised: '😲',
// //     neutral: '😐', calm: '😌', anxiety: '😰', unknown: '🤔'
// //   };
// //   return map[emotion?.toLowerCase()] || '🤔';
// // };

// // const getModalityIcon = (modality) => {
// //   const map = {
// //     text: '📝', audio: '🎙️', video: '🎬', image: '🖼️',
// //     multimodal: '🔀', photo: '🖼️'
// //   };
// //   return map[modality?.toLowerCase()] || '📊';
// // };

// // const getModalityLabel = (modality) => {
// //   const map = {
// //     text: 'Text', audio: 'Audio', video: 'Video',
// //     image: 'Image', multimodal: 'Multimodal', photo: 'Photo'
// //   };
// //   return map[modality?.toLowerCase()] || 'Analysis';
// // };

// // const getWellnessColor = (score) => {
// //   if (score >= 7) return '#4CAF50';
// //   if (score >= 4) return '#FF9800';
// //   return '#F44336';
// // };

// // // ── Expandable History Item ────────────────────────────────────────────────
// // function HistoryItem({ entry }) {
// //   const [expanded, setExpanded] = useState(false);
// //   const wellness = entry.wellnessScore || 5;
// //   const modality = entry.modality || 'unknown';

// //   return (
// //     <View style={styles.historyItem}>
// //       <View style={styles.historyMain}>
// //         <View style={styles.historyLeft}>
// //           <Text style={styles.historyEmoji}>{getEmotionEmoji(entry.emotion)}</Text>
// //           <View style={styles.historyInfo}>
// //             <Text style={styles.historyEmotion}>
// //               {entry.emotion?.toUpperCase() || 'UNKNOWN'}
// //             </Text>
// //             <Text style={styles.historyDate}>
// //               {entry.formattedDate} • {entry.formattedTime}
// //             </Text>
// //             <Text style={styles.historyModality}>
// //               {getModalityIcon(modality)} {getModalityLabel(modality)}
// //             </Text>
// //           </View>
// //         </View>
// //         <View style={styles.historyRight}>
// //           <Text style={[styles.historyWellness, { color: getWellnessColor(wellness) }]}>
// //             {wellness.toFixed(1)}
// //           </Text>
// //           <Text style={styles.wellnessLabel}>/10</Text>
// //           <TouchableOpacity
// //             style={styles.viewMoreButton}
// //             onPress={() => setExpanded(!expanded)}
// //           >
// //             <Text style={styles.viewMoreText}>{expanded ? 'Less ▲' : 'More ▼'}</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {expanded && (
// //         <View style={styles.expandedDetail}>
// //           {entry.inputText ? (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailBlockTitle}>Text Input</Text>
// //               <Text style={styles.detailText}>{entry.inputText}</Text>
// //             </View>
// //           ) : null}
// //           {entry.inputImageUri ? (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailBlockTitle}>Image</Text>
// //               <Image
// //                 source={{ uri: entry.inputImageUri }}
// //                 style={styles.detailImage}
// //                 resizeMode="cover"
// //               />
// //             </View>
// //           ) : null}
// //           {entry.hasAudio ? (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailBlockTitle}>Audio</Text>
// //               <View style={styles.mediaIndicator}>
// //                 <Text style={styles.mediaIndicatorText}>Audio recording was included</Text>
// //               </View>
// //             </View>
// //           ) : null}
// //           {entry.hasVideo ? (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailBlockTitle}>Video</Text>
// //               <View style={styles.mediaIndicator}>
// //                 <Text style={styles.mediaIndicatorText}>Video was included in this analysis</Text>
// //               </View>
// //             </View>
// //           ) : null}
// //           {!entry.inputText && !entry.inputImageUri && !entry.hasAudio && !entry.hasVideo && (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailNoData}>
// //                 Input details weren't saved for this entry.{'\n'}
// //                 Future entries will show full input here.
// //               </Text>
// //             </View>
// //           )}
// //           {entry.interpretation ? (
// //             <View style={styles.detailBlock}>
// //               <Text style={styles.detailBlockTitle}>💭 Interpretation</Text>
// //               <Text style={styles.detailText}>{entry.interpretation}</Text>
// //             </View>
// //           ) : null}
// //         </View>
// //       )}
// //     </View>
// //   );
// // }

// // // ── Main Screen ────────────────────────────────────────────────────────────
// // export default function MoodTrackingScreen({ navigation }) {
// //   const [moodHistory, setMoodHistory] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showCrisisAlert, setShowCrisisAlert] = useState(false);

// //   useEffect(() => { loadMoodHistory(); }, []);

// //   const loadMoodHistory = async () => {
// //     try {
// //       const raw = await AsyncStorage.getItem('moodHistory');
// //       console.log('RAW STORED DATA:', raw); // ← helpful for debugging

// //       if (raw) {
// //         const parsed = JSON.parse(raw);

// //         // Sort newest first for display
// //         parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// //         // Keep last 100 entries (NOT 30 — so older days aren't lost)
// //         const recent = parsed.slice(0, 100).map(e => ({
// //           ...e,
// //           formattedDate: formatDate(e.timestamp),
// //           formattedTime: formatTime(e.timestamp),
// //         }));

// //         setMoodHistory(recent);

// //         // Crisis check on avg of last 7 days only
// //         const last7 = getLast7DaysEntries(recent);
// //         if (last7.length > 0) {
// //           const avg = last7.reduce((s, e) => s + (e.wellnessScore || 5), 0) / last7.length;
// //           if (avg <= 3.0) setShowCrisisAlert(true);
// //         }
// //       }
// //     } catch (e) {
// //       console.error('Error loading mood history:', e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const clearHistory = () => {
// //     Alert.alert(
// //       'Clear History',
// //       'This will permanently delete all your mood history. Are you sure?',
// //       [
// //         { text: 'Cancel', style: 'cancel' },
// //         {
// //           text: 'Clear', style: 'destructive',
// //           onPress: async () => {
// //             await AsyncStorage.removeItem('moodHistory');
// //             setMoodHistory([]);
// //             setShowCrisisAlert(false);
// //           }
// //         }
// //       ]
// //     );
// //   };

// //   const formatDate = (timestamp) => {
// //     const date = new Date(timestamp);
// //     const today = new Date();
// //     const yesterday = new Date(today);
// //     yesterday.setDate(yesterday.getDate() - 1);
// //     if (date.toDateString() === today.toDateString()) return 'Today';
// //     if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
// //     return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// //   };

// //   const formatTime = (ts) =>
// //     new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// //   // ── Get entries only from last 7 days ─────────────────────────────────────
// //   const getLast7DaysEntries = (history) => {
// //     const cutoff = new Date();
// //     cutoff.setDate(cutoff.getDate() - 7);
// //     cutoff.setHours(0, 0, 0, 0);
// //     return history.filter(e => new Date(e.timestamp) >= cutoff);
// //   };

// //   // ── Chart: last 7 days, average per day ───────────────────────────────────
// //   // Days with NO data show a dotted gap instead of dropping to 0
// //   const getLast7DaysChartData = () => {
// //     const today = new Date();
// //     const days = Array.from({ length: 7 }, (_, i) => {
// //       const date = new Date(today);
// //       date.setDate(date.getDate() - (6 - i));
// //       date.setHours(0, 0, 0, 0);
// //       const nextDay = new Date(date);
// //       nextDay.setDate(nextDay.getDate() + 1);

// //       const dayEntries = moodHistory.filter(e => {
// //         const d = new Date(e.timestamp);
// //         return d >= date && d < nextDay;
// //       });

// //       const avg = dayEntries.length > 0
// //         ? dayEntries.reduce((s, e) => s + (e.wellnessScore || 5), 0) / dayEntries.length
// //         : null;

// //       const label = i === 6
// //         ? 'Today'
// //         : date.toLocaleDateString('en-US', { weekday: 'short' });

// //       return { label, avg, hasData: dayEntries.length > 0, count: dayEntries.length };
// //     });
// //     return days;
// //   };

// //   const chartDays = getLast7DaysChartData();

// //   // For days with no data, interpolate between nearest known values
// //   // so chart doesn't show misleading 0 dips
// //   const interpolateChartValues = (days) => {
// //     const values = days.map(d => d.avg);

// //     // Find first and last known value for edge fallback
// //     const knownValues = values.filter(v => v !== null);
// //     if (knownValues.length === 0) return values.map(() => 5); // all unknown → flat 5

// //     const fallback = knownValues.reduce((a, b) => a + b, 0) / knownValues.length;

// //     // Fill nulls: use nearest neighbor average
// //     const filled = [...values];
// //     for (let i = 0; i < filled.length; i++) {
// //       if (filled[i] === null) {
// //         // Find prev and next known
// //         let prev = null, next = null;
// //         for (let j = i - 1; j >= 0; j--) { if (values[j] !== null) { prev = values[j]; break; } }
// //         for (let j = i + 1; j < values.length; j++) { if (values[j] !== null) { next = values[j]; break; } }

// //         if (prev !== null && next !== null) filled[i] = (prev + next) / 2;
// //         else if (prev !== null) filled[i] = prev;
// //         else if (next !== null) filled[i] = next;
// //         else filled[i] = fallback;
// //       }
// //     }
// //     return filled.map(v => Math.round(v * 10) / 10);
// //   };

// //   const chartValues = interpolateChartValues(chartDays);
// //   const chartLabels = chartDays.map(d => d.label);
// //   const hasAnyData = chartDays.some(d => d.hasData);

// //   // ── Stats ─────────────────────────────────────────────────────────────────
// //   const avgWellness = moodHistory.length > 0
// //     ? moodHistory.reduce((s, e) => s + (e.wellnessScore || 5), 0) / moodHistory.length
// //     : null;

// //   const daysTracked = moodHistory.length > 0
// //     ? Math.max(1, Math.ceil(
// //         (new Date() - new Date(moodHistory[moodHistory.length - 1]?.timestamp))
// //         / (1000 * 60 * 60 * 24)
// //       ))
// //     : 0;

// //   // ── Loading ───────────────────────────────────────────────────────────────
// //   if (loading) {
// //     return (
// //       <View style={styles.container}>
// //         <View style={styles.header}>
// //           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //             <Text style={styles.backButtonText}>← Back</Text>
// //           </TouchableOpacity>
// //           <Text style={styles.headerTitle}>Mood Tracking</Text>
// //         </View>
// //         <View style={styles.loadingContainer}>
// //           <Text style={styles.loadingText}>Loading history...</Text>
// //         </View>
// //       </View>
// //     );
// //   }

// //   // ── Render ────────────────────────────────────────────────────────────────
// //   return (
// //     <ScrollView style={styles.container}>

// //       {/* Header */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //           <Text style={styles.backButtonText}>← Back</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>Mood Tracking</Text>
// //         <Text style={styles.headerSubtitle}>{moodHistory.length} total entries</Text>
// //       </View>

// //       {/* Crisis Banner */}
// //       {avgWellness !== null && avgWellness <= 3.0 && (
// //         <TouchableOpacity
// //           style={styles.crisisBanner}
// //           onPress={() => setShowCrisisAlert(true)}
// //           activeOpacity={0.85}
// //         >
// //           <View style={styles.crisisBannerLeft}>
// //             <Text style={styles.crisisBannerEmoji}>💙</Text>
// //             <View>
// //               <Text style={styles.crisisBannerTitle}>Your wellness needs attention</Text>
// //               <Text style={styles.crisisBannerSub}>
// //                 Avg score {avgWellness.toFixed(1)}/10 — Tap to view helplines
// //               </Text>
// //             </View>
// //           </View>
// //           <Text style={styles.crisisBannerArrow}>›</Text>
// //         </TouchableOpacity>
// //       )}

// //       {moodHistory.length === 0 ? (
// //         <View style={styles.emptyContainer}>
// //           <Text style={styles.emptyIcon}></Text>
// //           <Text style={styles.emptyTitle}>No mood history yet</Text>
// //           <Text style={styles.emptyText}>
// //             Start analyzing your emotions to see your mood trends over time!
// //           </Text>
// //           <TouchableOpacity
// //             style={styles.emptyButton}
// //             onPress={() => navigation.navigate('Home')}
// //           >
// //             <Text style={styles.emptyButtonText}>Analyze Now</Text>
// //           </TouchableOpacity>
// //         </View>
// //       ) : (
// //         <>
// //           {/* ── Chart ── */}
// //           <View style={styles.chartCard}>
// //             <Text style={styles.chartTitle}>7-Day Wellness Trend</Text>

// //             {/* Day summary dots */}
// //             <View style={styles.dayDots}>
// //               {chartDays.map((day, i) => (
// //                 <View key={i} style={styles.dayDotItem}>
// //                   <View style={[
// //                     styles.dayDot,
// //                     {
// //                       backgroundColor: day.hasData
// //                         ? getWellnessColor(day.avg)
// //                         : '#E0E0E0'
// //                     }
// //                   ]} />
// //                   <Text style={styles.dayDotLabel}>{day.label}</Text>
// //                   <Text style={styles.dayDotCount}>
// //                     {day.hasData ? `${day.avg.toFixed(1)}` : '–'}
// //                   </Text>
// //                 </View>
// //               ))}
// //             </View>

// //             {hasAnyData ? (
// //               <LineChart
// //                 data={{
// //                   labels: chartLabels,
// //                   datasets: [{
// //                     data: chartValues,
// //                     color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
// //                     strokeWidth: 2,
// //                   }],
// //                 }}
// //                 width={SCREEN_W - 50}
// //                 height={200}
// //                 fromZero
// //                 segments={5}
// //                 chartConfig={{
// //                   backgroundColor: '#6C63FF',
// //                   backgroundGradientFrom: '#6C63FF',
// //                   backgroundGradientTo: '#8B7FFF',
// //                   decimalPlaces: 1,
// //                   color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
// //                   labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
// //                   style: { borderRadius: 16 },
// //                   propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
// //                 }}
// //                 yAxisSuffix=""
// //                 yAxisLabel=""
// //                 yAxisMin={0}
// //                 yAxisMax={10}
// //                 bezier
// //                 style={styles.chart}
// //                 withVerticalLines={false}
// //                 withHorizontalLabels
// //                 withDots
// //               />
// //             ) : (
// //               <View style={styles.noChartData}>
// //                 <Text style={styles.noChartText}>
// //                   No data for the last 7 days yet.{'\n'}Analyze your mood to start the chart!
// //                 </Text>
// //               </View>
// //             )}

// //             <View style={styles.chartLegend}>
// //               <View style={styles.legendRow}>
// //                 <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
// //                 <Text style={styles.legendText}>Good (7–10)</Text>
// //               </View>
// //               <View style={styles.legendRow}>
// //                 <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
// //                 <Text style={styles.legendText}>Moderate (4–7)</Text>
// //               </View>
// //               <View style={styles.legendRow}>
// //                 <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
// //                 <Text style={styles.legendText}>Low (0–4)</Text>
// //               </View>
// //             </View>
// //           </View>

// //           {/* ── Stats ── */}
// //           <View style={styles.statsCard}>
// //             <Text style={styles.statsTitle}>Statistics</Text>
// //             <View style={styles.statsRow}>
// //               <View style={styles.statBox}>
// //                 <Text style={styles.statValue}>{moodHistory.length}</Text>
// //                 <Text style={styles.statLabel}>Total Entries</Text>
// //               </View>
// //               <View style={styles.statBox}>
// //                 <Text style={[styles.statValue, { color: getWellnessColor(avgWellness) }]}>
// //                   {avgWellness.toFixed(1)}
// //                 </Text>
// //                 <Text style={styles.statLabel}>Avg Wellness</Text>
// //               </View>
// //               <View style={styles.statBox}>
// //                 <Text style={styles.statValue}>{daysTracked}</Text>
// //                 <Text style={styles.statLabel}>Days Tracked</Text>
// //               </View>
// //             </View>
// //             <View style={styles.avgBarContainer}>
// //               <View style={[styles.avgBarFill, {
// //                 width: `${(avgWellness / 10) * 100}%`,
// //                 backgroundColor: getWellnessColor(avgWellness),
// //               }]} />
// //             </View>
// //             <Text style={[styles.avgBarLabel, { color: getWellnessColor(avgWellness) }]}>
// //               {avgWellness >= 7 ? '🟢 Overall wellness is good'
// //                 : avgWellness >= 4 ? '🟡 Wellness is moderate'
// //                 : '🔴 Wellness needs attention — help is available'}
// //             </Text>
// //           </View>

// //           {/* ── History ── */}
// //           <View style={styles.historyCard}>
// //             <View style={styles.historyHeader}>
// //               <Text style={styles.historyTitle}>History</Text>
// //               <TouchableOpacity onPress={clearHistory}>
// //                 <Text style={styles.clearText}>Clear All</Text>
// //               </TouchableOpacity>
// //             </View>
// //             <Text style={styles.historyHint}>Tap "More ▼" on any entry to see input details</Text>
// //             {moodHistory.map((entry, index) => (
// //               <HistoryItem key={`${entry.timestamp}-${index}`} entry={entry} />
// //             ))}
// //           </View>

// //           {/* ── Tip ── */}
// //           <View style={styles.tipBox}>
// //             <Text style={styles.tipTitle}>💡 Tips</Text>
// //             <Text style={styles.tipText}>• Analyze daily for accurate 7-day trends</Text>
// //             <Text style={styles.tipText}>• Higher scores reflect better emotional wellness</Text>
// //             <Text style={styles.tipText}>• Tap any entry to view its input details</Text>
// //           </View>
// //         </>
// //       )}

// //       <View style={{ height: 30 }} />

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

// //   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
// //   loadingText: { fontSize: 16, color: '#666' },

// //   crisisBanner: {
// //     backgroundColor: '#D32F2F', marginHorizontal: 15, marginTop: 15,
// //     borderRadius: 14, padding: 14, flexDirection: 'row',
// //     alignItems: 'center', justifyContent: 'space-between', elevation: 4,
// //   },
// //   crisisBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
// //   crisisBannerEmoji: { fontSize: 28, marginRight: 12 },
// //   crisisBannerTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
// //   crisisBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
// //   crisisBannerArrow: { fontSize: 24, color: 'white', fontWeight: 'bold', paddingLeft: 8 },

// //   emptyContainer: { alignItems: 'center', padding: 50 },
// //   emptyIcon: { fontSize: 80, marginBottom: 20 },
// //   emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
// //   emptyText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30 },
// //   emptyButton: {
// //     backgroundColor: '#6C63FF', paddingHorizontal: 30,
// //     paddingVertical: 15, borderRadius: 25,
// //   },
// //   emptyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

// //   chartCard: {
// //     backgroundColor: 'white', margin: 15, padding: 15,
// //     borderRadius: 16, elevation: 3,
// //   },
// //   chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },

// //   // Day summary dots above chart
// //   dayDots: {
// //     flexDirection: 'row', justifyContent: 'space-between',
// //     marginBottom: 12, paddingHorizontal: 4,
// //   },
// //   dayDotItem: { alignItems: 'center', flex: 1 },
// //   dayDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 3 },
// //   dayDotLabel: { fontSize: 9, color: '#999' },
// //   dayDotCount: { fontSize: 10, fontWeight: 'bold', color: '#555' },

// //   chart: { marginVertical: 8, borderRadius: 16 },
// //   noChartData: {
// //     height: 120, justifyContent: 'center', alignItems: 'center',
// //     backgroundColor: '#F5F5F5', borderRadius: 12, marginVertical: 8,
// //   },
// //   noChartText: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },

// //   chartLegend: {
// //     flexDirection: 'row', justifyContent: 'center',
// //     gap: 16, marginTop: 10,
// //   },
// //   legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
// //   legendDot: { width: 10, height: 10, borderRadius: 5 },
// //   legendText: { fontSize: 11, color: '#666' },

// //   statsCard: {
// //     backgroundColor: 'white', marginHorizontal: 15,
// //     marginBottom: 15, padding: 20, borderRadius: 16, elevation: 3,
// //   },
// //   statsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
// //   statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
// //   statBox: { alignItems: 'center' },
// //   statValue: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
// //   statLabel: { fontSize: 12, color: '#999', marginTop: 5 },
// //   avgBarContainer: {
// //     height: 10, backgroundColor: '#F0F0F0', borderRadius: 5,
// //     overflow: 'hidden', marginBottom: 8,
// //   },
// //   avgBarFill: { height: '100%', borderRadius: 5 },
// //   avgBarLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

// //   historyCard: {
// //     backgroundColor: 'white', marginHorizontal: 15,
// //     marginBottom: 15, padding: 20, borderRadius: 16, elevation: 3,
// //   },
// //   historyHeader: {
// //     flexDirection: 'row', justifyContent: 'space-between',
// //     alignItems: 'center', marginBottom: 6,
// //   },
// //   historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
// //   clearText: { fontSize: 14, color: '#FF4444', fontWeight: '600' },
// //   historyHint: { fontSize: 12, color: '#999', marginBottom: 12 },

// //   historyItem: {
// //     borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 12,
// //   },
// //   historyMain: {
// //     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
// //   },
// //   historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
// //   historyEmoji: { fontSize: 34, marginRight: 12 },
// //   historyInfo: { flex: 1 },
// //   historyEmotion: { fontSize: 15, fontWeight: 'bold', color: '#333' },
// //   historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
// //   historyModality: { fontSize: 11, color: '#6C63FF', marginTop: 2 },
// //   historyRight: { alignItems: 'flex-end' },
// //   historyWellness: { fontSize: 22, fontWeight: 'bold' },
// //   wellnessLabel: { fontSize: 11, color: '#999' },

// //   viewMoreButton: {
// //     marginTop: 6, backgroundColor: '#EDE7F6',
// //     paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
// //   },
// //   viewMoreText: { fontSize: 11, color: '#6C63FF', fontWeight: '700' },

// //   expandedDetail: {
// //     backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, marginTop: 10,
// //   },
// //   detailBlock: { marginBottom: 10 },
// //   detailBlockTitle: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 5 },
// //   detailText: { fontSize: 13, color: '#333', lineHeight: 19 },
// //   detailImage: { width: '100%', height: 160, borderRadius: 10 },
// //   mediaIndicator: {
// //     backgroundColor: '#E8EAF6', borderRadius: 8, padding: 10, alignItems: 'center',
// //   },
// //   mediaIndicatorText: { fontSize: 13, color: '#5C6BC0', fontWeight: '600' },
// //   detailNoData: {
// //     fontSize: 13, color: '#999', textAlign: 'center', fontStyle: 'italic', lineHeight: 19,
// //   },

// //   tipBox: {
// //     backgroundColor: 'white', borderRadius: 12, padding: 15,
// //     marginHorizontal: 15, marginBottom: 10, elevation: 2,
// //     borderLeftWidth: 4, borderLeftColor: '#6C63FF',
// //   },
// //   tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   tipText: { fontSize: 13, color: '#666', marginBottom: 3 },
// // });

// // src/screens/MoodTrackingScreen.js
// // src/screens/MoodTrackingScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   Dimensions, Image, Alert, StatusBar, ActivityIndicator,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LineChart } from 'react-native-chart-kit';
// import CrisisAlert from '../components/CrisisAlert';
// import { C, getEmoji, getWellnessColor, getWellnessLabel } from '../theme';

// const SCREEN_W = Dimensions.get('window').width;

// const MODALITY_ICON  = { text:'📝', audio:'🎙️', video:'🎬', image:'🖼️', multimodal:'🔀', photo:'🖼️' };
// const MODALITY_LABEL = { text:'Text', audio:'Audio', video:'Video', image:'Image', multimodal:'Multimodal', photo:'Photo' };

// // ── Expandable history item ────────────────────────────────────────────────
// function HistoryItem({ entry }) {
//   const [expanded, setExpanded] = useState(false);
//   const wellness = entry.wellnessScore || 5;
//   const modality = entry.modality || 'unknown';
//   const wc = getWellnessColor(wellness);

//   return (
//     <View style={s.histItem}>
//       <TouchableOpacity style={s.histMain} onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>
//         <Text style={{ fontSize: 30 }}>{getEmoji(entry.emotion)}</Text>
//         <View style={s.histInfo}>
//           <Text style={s.histEmo}>{entry.emotion?.charAt(0).toUpperCase() + entry.emotion?.slice(1) || 'Unknown'}</Text>
//           <Text style={s.histMeta}>
//             {entry.formattedDate} · {entry.formattedTime}
//           </Text>
//           <View style={[s.histModalBadge, { backgroundColor: C.primaryLight }]}>
//             <Text style={[s.histModalTxt, { color: C.primary }]}>
//               {MODALITY_ICON[modality] || '📊'} {MODALITY_LABEL[modality] || 'Analysis'}
//             </Text>
//           </View>
//         </View>
//         <View style={s.histRight}>
//           <Text style={[s.histScore, { color: wc }]}>{wellness.toFixed(1)}</Text>
//           <Text style={s.histScoreOf}>/10</Text>
//           <Text style={[s.histToggle, { color: C.primary }]}>{expanded ? '▲' : '▼'}</Text>
//         </View>
//       </TouchableOpacity>

//       {expanded && (
//         <View style={s.histDetail}>
//           {entry.inputText && (
//             <View style={s.detailBlock}>
//               <Text style={s.detailLbl}>📝  Text Input</Text>
//               <Text style={s.detailTxt}>{entry.inputText}</Text>
//             </View>
//           )}
//           {entry.inputImageUri && (
//             <View style={s.detailBlock}>
//               <Text style={s.detailLbl}>🖼️  Image</Text>
//               <Image source={{ uri: entry.inputImageUri }} style={s.detailImg} resizeMode="cover" />
//             </View>
//           )}
//           {entry.hasAudio && (
//             <View style={[s.detailBlock, s.mediaBadge]}>
//               <Text style={s.mediaBadgeTxt}>🎙️  Audio recording was included</Text>
//             </View>
//           )}
//           {entry.hasVideo && (
//             <View style={[s.detailBlock, s.mediaBadge]}>
//               <Text style={s.mediaBadgeTxt}>🎬  Video was included</Text>
//             </View>
//           )}
//           {!entry.inputText && !entry.inputImageUri && !entry.hasAudio && !entry.hasVideo && (
//             <Text style={s.detailNoData}>Input details were not saved for this entry.</Text>
//           )}
//           {entry.interpretation && (
//             <View style={s.detailBlock}>
//               <Text style={s.detailLbl}>💭  Interpretation</Text>
//               <Text style={s.detailTxt}>{entry.interpretation}</Text>
//             </View>
//           )}
//           <View style={s.wellnessBar}>
//             <View style={[s.wellnessFill, { width: `${(wellness / 10) * 100}%`, backgroundColor: wc }]} />
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// // ── Main screen ────────────────────────────────────────────────────────────
// export default function MoodTrackingScreen({ navigation }) {
//   const [moodHistory, setMoodHistory] = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [showCrisisAlert, setShowCrisis] = useState(false);

//   useEffect(() => { loadMoodHistory(); }, []);

//   const loadMoodHistory = async () => {
//     try {
//       const raw = await AsyncStorage.getItem('moodHistory');
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//         const recent = parsed.slice(0, 100).map(e => ({
//           ...e,
//           formattedDate: formatDate(e.timestamp),
//           formattedTime: formatTime(e.timestamp),
//         }));
//         setMoodHistory(recent);
//         const last7 = getLast7(recent);
//         if (last7.length > 0) {
//           const avg = last7.reduce((s, e) => s + (e.wellnessScore || 5), 0) / last7.length;
//           if (avg <= 3.0) setShowCrisis(true);
//         }
//       }
//     } catch (e) { console.error('Error loading mood history:', e); }
//     finally { setLoading(false); }
//   };

//   const clearHistory = () => {
//     Alert.alert('Clear History', 'This will permanently delete all your mood history. Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Clear', style: 'destructive', onPress: async () => {
//         await AsyncStorage.removeItem('moodHistory');
//         setMoodHistory([]); setShowCrisis(false);
//       }},
//     ]);
//   };

//   const formatDate = (ts) => {
//     const d = new Date(ts); const today = new Date(); const yest = new Date(today);
//     yest.setDate(yest.getDate() - 1);
//     if (d.toDateString() === today.toDateString()) return 'Today';
//     if (d.toDateString() === yest.toDateString()) return 'Yesterday';
//     return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
//   };

//   const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

//   const getLast7 = (history) => {
//     const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7); cutoff.setHours(0,0,0,0);
//     return history.filter(e => new Date(e.timestamp) >= cutoff);
//   };

//   const getChartDays = () => {
//     const today = new Date();
//     return Array.from({ length: 7 }, (_, i) => {
//       const date = new Date(today); date.setDate(date.getDate() - (6 - i)); date.setHours(0,0,0,0);
//       const next = new Date(date); next.setDate(next.getDate() + 1);
//       const dayEntries = moodHistory.filter(e => { const d = new Date(e.timestamp); return d >= date && d < next; });
//       const avg = dayEntries.length > 0 ? dayEntries.reduce((s,e) => s + (e.wellnessScore||5), 0) / dayEntries.length : null;
//       const label = i === 6 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
//       return { label, avg, hasData: dayEntries.length > 0, count: dayEntries.length };
//     });
//   };

//   const chartDays   = getChartDays();
//   // No data for a day → 0, not interpolated
//   const chartValues = chartDays.map(d => d.hasData ? Math.round(d.avg * 10) / 10 : 0);
//   const chartLabels = chartDays.map(d => d.label);
//   const hasAnyData  = chartDays.some(d => d.hasData);

//   const avgWellness = moodHistory.length > 0
//     ? moodHistory.slice(0, 20).reduce((s, e) => s + (e.wellnessScore || 5), 0) / Math.min(moodHistory.length, 20)
//     : null;

//   const daysTracked = moodHistory.length > 0
//     ? Math.max(1, Math.ceil((new Date() - new Date(moodHistory[moodHistory.length - 1]?.timestamp)) / (1000 * 60 * 60 * 24)))
//     : 0;

//   if (loading) {
//     return (
//       <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
//         <ActivityIndicator size="large" color={C.primary} />
//         <Text style={{ marginTop: 12, color: C.textMid, fontSize: 14 }}>Loading history…</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView showsVerticalScrollIndicator={false}>

//         {/* Header */}
//         <View style={s.header}>
//           <View style={s.decor} />
//           <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
//           <Text style={s.headerTitle}>📈  Mood Tracking</Text>
//           <Text style={s.headerSub}>{moodHistory.length} total entries</Text>
//         </View>

//         {/* Crisis banner */}
//         {avgWellness !== null && avgWellness <= 3.0 && (
//           <TouchableOpacity style={s.crisisBanner} onPress={() => setShowCrisis(true)} activeOpacity={0.85}>
//             <Text style={s.crisisTxt}>💙  Your wellness needs attention — Avg {avgWellness.toFixed(1)}/10 · Tap for support</Text>
//           </TouchableOpacity>
//         )}

//         {moodHistory.length === 0 ? (
//           <View style={s.empty}>
//             <Text style={{ fontSize: 48, marginBottom: 14 }}>📊</Text>
//             <Text style={s.emptyTitle}>No mood history yet</Text>
//             <Text style={s.emptySub}>Start analysing your emotions to see your trends over time.</Text>
//             <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
//               <Text style={s.emptyBtnTxt}>Analyse Now →</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             {/* Stats row */}
//             <View style={s.statsRow}>
//               <View style={s.statCard}>
//                 <Text style={s.statVal}>{moodHistory.length}</Text>
//                 <Text style={s.statLbl}>Entries</Text>
//               </View>
//               <View style={[s.statCard, { borderColor: avgWellness ? getWellnessColor(avgWellness) : C.border }]}>
//                 <Text style={[s.statVal, { color: avgWellness ? getWellnessColor(avgWellness) : C.textLight }]}>
//                   {avgWellness !== null ? avgWellness.toFixed(1) : '—'}
//                 </Text>
//                 <Text style={s.statLbl}>Avg Score</Text>
//               </View>
//               <View style={s.statCard}>
//                 <Text style={s.statVal}>{daysTracked}</Text>
//                 <Text style={s.statLbl}>Days Active</Text>
//               </View>
//             </View>

//             {/* Chart */}
//             <View style={s.chartCard}>
//               <Text style={s.chartTitle}>7-Day Wellness Trend</Text>
//               {/* Day dots */}
//               <View style={s.dayDots}>
//                 {chartDays.map((day, i) => (
//                   <View key={i} style={s.dayDotItem}>
//                     <View style={[s.dayDot, { backgroundColor: day.hasData ? getWellnessColor(day.avg) : C.border }]} />
//                     <Text style={s.dayDotLbl}>{day.label}</Text>
//                     <Text style={[s.dayDotScore, { color: day.hasData ? getWellnessColor(day.avg) : C.textLight }]}>
//                       {day.hasData ? day.avg.toFixed(1) : '–'}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//               {hasAnyData && (
//                 <LineChart
//                   data={{ labels: chartLabels, datasets: [{ data: chartValues, color: () => C.primary, strokeWidth: 2.5 }] }}
//                   width={SCREEN_W - 48}
//                   height={160}
//                   chartConfig={{
//                     backgroundColor: C.card,
//                     backgroundGradientFrom: C.card,
//                     backgroundGradientTo: C.card,
//                     decimalPlaces: 1,
//                     color: (o = 1) => `rgba(74, 144, 217, ${o})`,
//                     labelColor: () => C.textMid,
//                     propsForDots: { r: '5', strokeWidth: '2', stroke: C.primary },
//                     propsForBackgroundLines: { strokeDasharray: '4', stroke: C.border },
//                   }}
//                   bezier
//                   style={s.chartStyle}
//                   fromZero={true}
//                   yAxisSuffix=""
//                   withInnerLines
//                 />
//               )}
//               {!hasAnyData && (
//                 <View style={s.noChart}>
//                   <Text style={s.noChartTxt}>No data for the past 7 days yet</Text>
//                 </View>
//               )}
//             </View>

//             {/* History list */}
//             <View style={s.histSection}>
//               <View style={s.histHeader}>
//                 <Text style={s.sectionTitle}>History</Text>
//                 <TouchableOpacity onPress={clearHistory}>
//                   <Text style={s.clearTxt}>Clear All</Text>
//                 </TouchableOpacity>
//               </View>
//               {moodHistory.map((entry, i) => (
//                 <HistoryItem key={entry.id || i} entry={entry} />
//               ))}
//             </View>
//           </>
//         )}

//         <View style={{ height: 32 }} />
//       </ScrollView>
//       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:           { flex: 1, backgroundColor: C.bg },
//   header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:        { marginBottom: 10 },
//   backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
//   crisisBanner:   { backgroundColor: C.accentRed, padding: 13, paddingHorizontal: 16 },
//   crisisTxt:      { color: '#fff', fontSize: 13, fontWeight: '700' },
//   empty:          { margin: 24, padding: 28, backgroundColor: C.card, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: C.border },
//   emptyTitle:     { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 8 },
//   emptySub:       { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
//   emptyBtn:       { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
//   emptyBtnTxt:    { color: '#fff', fontSize: 14, fontWeight: '700' },
//   statsRow:       { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 4 },
//   statCard:       { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
//   statVal:        { fontSize: 22, fontWeight: '700', color: C.text },
//   statLbl:        { fontSize: 10, color: C.textLight, marginTop: 3, fontWeight: '600' },
//   chartCard:      { margin: 16, backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
//   chartTitle:     { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 14 },
//   dayDots:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
//   dayDotItem:     { alignItems: 'center', gap: 4 },
//   dayDot:         { width: 10, height: 10, borderRadius: 5 },
//   dayDotLbl:      { fontSize: 9, color: C.textMid, fontWeight: '600' },
//   dayDotScore:    { fontSize: 10, fontWeight: '700' },
//   chartStyle:     { borderRadius: 12, marginTop: 4 },
//   noChart:        { height: 100, justifyContent: 'center', alignItems: 'center' },
//   noChartTxt:     { color: C.textLight, fontSize: 13 },
//   histSection:    { paddingHorizontal: 16 },
//   histHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   sectionTitle:   { fontSize: 15, fontWeight: '700', color: C.text },
//   clearTxt:       { fontSize: 13, color: C.accentRed, fontWeight: '600' },
//   histItem:       { backgroundColor: C.card, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
//   histMain:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
//   histInfo:       { flex: 1 },
//   histEmo:        { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
//   histMeta:       { fontSize: 11, color: C.textLight, marginBottom: 5 },
//   histModalBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
//   histModalTxt:   { fontSize: 10, fontWeight: '700' },
//   histRight:      { alignItems: 'center' },
//   histScore:      { fontSize: 20, fontWeight: '700' },
//   histScoreOf:    { fontSize: 11, color: C.textLight },
//   histToggle:     { fontSize: 11, marginTop: 4, fontWeight: '700' },
//   histDetail:     { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
//   detailBlock:    { marginTop: 10 },
//   detailLbl:      { fontSize: 11, fontWeight: '700', color: C.textMid, marginBottom: 5 },
//   detailTxt:      { fontSize: 13, color: C.text, lineHeight: 20 },
//   detailImg:      { width: '100%', height: 140, borderRadius: 10 },
//   detailNoData:   { fontSize: 12, color: C.textLight, marginTop: 8, fontStyle: 'italic' },
//   mediaBadge:     { backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
//   mediaBadgeTxt:  { fontSize: 12, color: C.primary, fontWeight: '600' },
//   wellnessBar:    { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
//   wellnessFill:   { height: '100%', borderRadius: 2 },
// });

// src/screens/MoodTrackingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import CrisisAlert from '../components/CrisisAlert';
import { C, getEmotionIcon, getWellnessColor, getWellnessLabel, MODALITY_ICON, MODALITY_LABEL } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { exportCSV, exportSummary } from '../utils/moodExport';

const SCREEN_W = Dimensions.get('window').width;

function HistoryItem({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const wellness = entry.wellnessScore || 5;
  const modality = entry.modality || 'unknown';
  const wc = getWellnessColor(wellness);
  const modIcon = MODALITY_ICON[modality] || 'chart-bar';
  const modLabel = MODALITY_LABEL[modality] || 'Analysis';

  return (
    <View style={s.histItem}>
      <TouchableOpacity style={s.histMain} onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>
        <Icon name={getEmotionIcon(entry.emotion)} size={30} color={wc} />
        <View style={s.histInfo}>
          <Text style={s.histEmo}>{entry.emotion?.charAt(0).toUpperCase() + entry.emotion?.slice(1) || 'Unknown'}</Text>
          <Text style={s.histMeta}>{entry.formattedDate} · {entry.formattedTime}</Text>
          <View style={[s.histModalBadge, { backgroundColor: C.primaryLight }]}>
            <Icon name={modIcon} size={10} color={C.primary} />
            <Text style={[s.histModalTxt, { color: C.primary }]}> {modLabel}</Text>
          </View>
        </View>
        <View style={s.histRight}>
          <Text style={[s.histScore, { color: wc }]}>{wellness.toFixed(1)}</Text>
          <Text style={s.histScoreOf}>/10</Text>
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.primary} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={s.histDetail}>
          {entry.inputText && (
            <View style={s.detailBlock}>
              <View style={s.detailLblRow}>
                <Icon name="text-box-edit-outline" size={12} color={C.textMid} />
                <Text style={s.detailLbl}> Text Input</Text>
              </View>
              <Text style={s.detailTxt}>{entry.inputText}</Text>
            </View>
          )}
          {entry.inputImageUri && (
            <View style={s.detailBlock}>
              <View style={s.detailLblRow}>
                <Icon name="image-outline" size={12} color={C.textMid} />
                <Text style={s.detailLbl}> Image</Text>
              </View>
              <Image source={{ uri: entry.inputImageUri }} style={s.detailImg} resizeMode="cover" />
            </View>
          )}
          {entry.hasAudio && (
            <View style={[s.detailBlock, s.mediaBadge]}>
              <Icon name="microphone-outline" size={14} color={C.primary} />
              <Text style={s.mediaBadgeTxt}> Audio recording was included</Text>
            </View>
          )}
          {entry.hasVideo && (
            <View style={[s.detailBlock, s.mediaBadge]}>
              <Icon name="video-outline" size={14} color={C.primary} />
              <Text style={s.mediaBadgeTxt}> Video was included</Text>
            </View>
          )}
          {!entry.inputText && !entry.inputImageUri && !entry.hasAudio && !entry.hasVideo && (
            <Text style={s.detailNoData}>Input details were not saved for this entry.</Text>
          )}
          {entry.interpretation && (
            <View style={s.detailBlock}>
              <View style={s.detailLblRow}>
                <Icon name="comment-text-outline" size={12} color={C.textMid} />
                <Text style={s.detailLbl}> Interpretation</Text>
              </View>
              <Text style={s.detailTxt}>{entry.interpretation}</Text>
            </View>
          )}
          <View style={s.wellnessBar}>
            <View style={[s.wellnessFill, { width: `${(wellness / 10) * 100}%`, backgroundColor: wc }]} />
          </View>
        </View>
      )}
    </View>
  );
}

export default function MoodTrackingScreen({ navigation }) {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCrisisAlert, setShowCrisis] = useState(false);

  useEffect(() => { loadMoodHistory(); }, []);

  const loadMoodHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem('moodHistory');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recent = parsed.slice(0, 100).map(e => ({
          ...e, formattedDate: formatDate(e.timestamp), formattedTime: formatTime(e.timestamp),
        }));
        setMoodHistory(recent);
        const last7 = getLast7(recent);
        if (last7.length > 0) {
          const avg = last7.reduce((s, e) => s + (e.wellnessScore || 5), 0) / last7.length;
          if (avg <= 3.0) setShowCrisis(true);
        }
      }
    } catch (e) { console.error('Error loading mood history:', e); }
    finally { setLoading(false); }
  };

  const clearHistory = () => {
    Alert.alert('Clear History', 'This will permanently delete all your mood history. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('moodHistory'); setMoodHistory([]); setShowCrisis(false);
      }},
    ]);
  };

  const formatDate = (ts) => {
    const d = new Date(ts); const today = new Date(); const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const getLast7 = (history) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7); cutoff.setHours(0,0,0,0);
    return history.filter(e => new Date(e.timestamp) >= cutoff);
  };

  const getChartDays = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today); date.setDate(date.getDate() - (6 - i)); date.setHours(0,0,0,0);
      const next = new Date(date); next.setDate(next.getDate() + 1);
      const dayEntries = moodHistory.filter(e => { const d = new Date(e.timestamp); return d >= date && d < next; });
      const avg = dayEntries.length > 0 ? dayEntries.reduce((s,e) => s + (e.wellnessScore||5), 0) / dayEntries.length : null;
      const label = i === 6 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
      return { label, avg, hasData: dayEntries.length > 0 };
    });
  };

  const chartDays   = getChartDays();
  // No data for a day → 0, not interpolated
  const chartValues = chartDays.map(d => d.hasData ? Math.round(d.avg * 10) / 10 : 0);
  const chartLabels = chartDays.map(d => d.label);
  const hasAnyData  = chartDays.some(d => d.hasData);

  const avgWellness = moodHistory.length > 0
    ? moodHistory.slice(0, 20).reduce((s, e) => s + (e.wellnessScore || 5), 0) / Math.min(moodHistory.length, 20)
    : null;

  const daysTracked = moodHistory.length > 0
    ? Math.max(1, Math.ceil((new Date() - new Date(moodHistory[moodHistory.length - 1]?.timestamp)) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ marginTop: 12, color: C.textMid, fontSize: 14 }}>Loading history…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View style={s.decor} />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mood Tracking</Text>
          <Text style={s.headerSub}>{moodHistory.length} total entries</Text>
        </View>

        {avgWellness !== null && avgWellness <= 3.0 && (
          <TouchableOpacity style={s.crisisBanner} onPress={() => setShowCrisis(true)} activeOpacity={0.85}>
            <Icon name="heart-pulse" size={16} color="#fff" />
            <Text style={s.crisisTxt}> Your wellness needs attention — Avg {avgWellness.toFixed(1)}/10 · Tap for support</Text>
          </TouchableOpacity>
        )}

        {moodHistory.length === 0 ? (
          <View style={s.empty}>
            <Icon name="chart-line" size={52} color={C.primary} />
            <Text style={s.emptyTitle}>No mood history yet</Text>
            <Text style={s.emptySub}>Start analysing your emotions to see your trends over time.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
              <Text style={s.emptyBtnTxt}>Analyse Now</Text>
              <Icon name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statVal}>{moodHistory.length}</Text>
                <Text style={s.statLbl}>Entries</Text>
              </View>
              <View style={[s.statCard, { borderColor: avgWellness ? getWellnessColor(avgWellness) : C.border }]}>
                <Text style={[s.statVal, { color: avgWellness ? getWellnessColor(avgWellness) : C.textLight }]}>
                  {avgWellness !== null ? avgWellness.toFixed(1) : '—'}
                </Text>
                <Text style={s.statLbl}>Avg Score</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statVal}>{daysTracked}</Text>
                <Text style={s.statLbl}>Days Active</Text>
              </View>
            </View>

            {/* Chart */}
            <View style={s.chartCard}>
              <View style={s.chartTitleRow}>
                <Icon name="chart-line" size={16} color={C.text} />
                <Text style={s.chartTitle}> 7-Day Wellness Trend</Text>
              </View>
              <View style={s.dayDots}>
                {chartDays.map((day, i) => (
                  <View key={i} style={s.dayDotItem}>
                    <View style={[s.dayDot, { backgroundColor: day.hasData ? getWellnessColor(day.avg) : C.border }]} />
                    <Text style={s.dayDotLbl}>{day.label}</Text>
                    <Text style={[s.dayDotScore, { color: day.hasData ? getWellnessColor(day.avg) : C.textLight }]}>
                      {day.hasData ? day.avg.toFixed(1) : '0'}
                    </Text>
                  </View>
                ))}
              </View>
              {hasAnyData ? (
                <LineChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues, color: () => C.primary, strokeWidth: 2.5 }] }}
                  width={SCREEN_W - 48}
                  height={160}
                  chartConfig={{
                    backgroundColor: C.card, backgroundGradientFrom: C.card, backgroundGradientTo: C.card,
                    decimalPlaces: 1,
                    color: (o = 1) => `rgba(74, 144, 217, ${o})`,
                    labelColor: () => C.textMid,
                    propsForDots: { r: '5', strokeWidth: '2', stroke: C.primary },
                    propsForBackgroundLines: { strokeDasharray: '4', stroke: C.border },
                  }}
                  bezier
                  style={s.chartStyle}
                  fromZero={true}
                  yAxisSuffix=""
                  withInnerLines
                />
              ) : (
                <View style={s.noChart}>
                  <Icon name="chart-line-variant" size={32} color={C.border} />
                  <Text style={s.noChartTxt}>No data for the past 7 days yet</Text>
                </View>
              )}
            </View>

            {/* History */}
            <View style={s.histSection}>
              <View style={s.histHeader}>
                <Text style={s.sectionTitle}>History</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity style={s.exportBtn} onPress={exportSummary} activeOpacity={0.85}>
                    <Text style={s.exportBtnTxt}>TXT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.exportBtn} onPress={exportCSV} activeOpacity={0.85}>
                    <Text style={s.exportBtnTxt}>CSV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.clearBtn} onPress={clearHistory}>
                    <Icon name="delete-outline" size={14} color={C.accentRed} />
                    <Text style={s.clearTxt}> Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {moodHistory.map((entry, i) => (
                <HistoryItem key={entry.id || i} entry={entry} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
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
  crisisBanner:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentRed, padding: 13, paddingHorizontal: 16 },
  crisisTxt:      { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty:          { margin: 24, padding: 28, backgroundColor: C.card, borderRadius: 18, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  emptyTitle:     { fontSize: 17, fontWeight: '700', color: C.text },
  emptySub:       { fontSize: 13, color: C.textMid, textAlign: 'center', lineHeight: 20 },
  emptyBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnTxt:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  statsRow:       { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 4 },
  statCard:       { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.border, elevation: 2 },
  statVal:        { fontSize: 22, fontWeight: '700', color: C.text },
  statLbl:        { fontSize: 10, color: C.textLight, marginTop: 3, fontWeight: '600' },
  chartCard:      { margin: 16, backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, elevation: 2 },
  chartTitleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  chartTitle:     { fontSize: 14, fontWeight: '700', color: C.text },
  dayDots:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dayDotItem:     { alignItems: 'center', gap: 4 },
  dayDot:         { width: 10, height: 10, borderRadius: 5 },
  dayDotLbl:      { fontSize: 9, color: C.textMid, fontWeight: '600' },
  dayDotScore:    { fontSize: 10, fontWeight: '700' },
  chartStyle:     { borderRadius: 12, marginTop: 4 },
  noChart:        { height: 100, justifyContent: 'center', alignItems: 'center', gap: 8 },
  noChartTxt:     { color: C.textLight, fontSize: 13 },
  histSection:    { paddingHorizontal: 16 },
  histHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: C.text },
  clearBtn:       { flexDirection: 'row', alignItems: 'center' },
  clearTxt:       { fontSize: 13, color: C.accentRed, fontWeight: '600' },
  exportBtn:      { backgroundColor: C.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  exportBtnTxt:   { fontSize: 11, fontWeight: '700', color: C.primary },
  histItem:       { backgroundColor: C.card, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', elevation: 2 },
  histMain:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  histInfo:       { flex: 1 },
  histEmo:        { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  histMeta:       { fontSize: 11, color: C.textLight, marginBottom: 5 },
  histModalBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  histModalTxt:   { fontSize: 10, fontWeight: '700' },
  histRight:      { alignItems: 'center', gap: 2 },
  histScore:      { fontSize: 20, fontWeight: '700' },
  histScoreOf:    { fontSize: 11, color: C.textLight },
  histDetail:     { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
  detailBlock:    { marginTop: 10 },
  detailLblRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailLbl:      { fontSize: 11, fontWeight: '700', color: C.textMid },
  detailTxt:      { fontSize: 13, color: C.text, lineHeight: 20 },
  detailImg:      { width: '100%', height: 140, borderRadius: 10 },
  detailNoData:   { fontSize: 12, color: C.textLight, marginTop: 8, fontStyle: 'italic' },
  mediaBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  mediaBadgeTxt:  { fontSize: 12, color: C.primary, fontWeight: '600' },
  wellnessBar:    { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  wellnessFill:   { height: '100%', borderRadius: 2 },
});