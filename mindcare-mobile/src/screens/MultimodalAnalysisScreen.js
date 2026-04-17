// // // src/screens/MultimodalAnalysisScreen.js — NO NETINFO, OFFLINE QUEUE, LOOP FIXED
// // import React, { useState, useRef, useEffect } from 'react';
// // import {
// //   View, Text, StyleSheet, TouchableOpacity, TextInput,
// //   ScrollView, Alert, ActivityIndicator, Image,
// // } from 'react-native';
// // import { Audio } from 'expo-av';
// // import * as ImagePicker from 'expo-image-picker';
// // import axios from 'axios';
// // import { saveMoodEntry } from '../utils/moodStorage';
// // import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
// // import CrisisAlert from '../components/CrisisAlert';

// // const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// // const checkOnline = async () => {
// //   try {
// //     const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
// //     return res.status === 204;
// //   } catch { return false; }
// // };

// // const getEmotionEmoji = (e) =>
// //   ({ happy:'😊', sad:'😢', angry:'😠', fearful:'😰', fear:'😰', disgust:'🤢', surprise:'😲', neutral:'😐', unknown:'🤔' })[e?.toLowerCase()] || '🤔';
// // const getWellnessColor = (s) => s >= 7 ? '#4CAF50' : s >= 4 ? '#FF9800' : '#F44336';

// // export default function MultimodalAnalysisScreen({ navigation }) {
// //   const [text, setText]                         = useState('');
// //   const [audioUri, setAudioUri]                 = useState(null);
// //   const [imageUri, setImageUri]                 = useState(null);
// //   const [isRecordingAudio, setIsRecordingAudio] = useState(false);
// //   const [isAnalyzing, setIsAnalyzing]           = useState(false);
// //   const [results, setResults]                   = useState(null);
// //   const [showCrisisAlert, setShowCrisisAlert]   = useState(false);
// //   const [isOffline, setIsOffline]               = useState(false);
// //   const [pendingCount, setPendingCount]         = useState(0);
// //   const [isSyncing, setIsSyncing]               = useState(false);

// //   const recordingRef  = useRef(null);
// //   // ── Guard: prevents syncQueue running in parallel ─────────────────────────
// //   const isSyncingRef  = useRef(false);
// //   // ── Guard: tracks previous online state to detect transitions ────────────
// //   const wasOfflineRef = useRef(false);

// //   useEffect(() => {
// //     checkStatus();

// //     const interval = setInterval(async () => {
// //       const online = await checkOnline();
// //       setIsOffline(!online);

// //       if (online) {
// //         // Only auto-sync when transitioning offline → online, not every tick
// //         if (wasOfflineRef.current && !isSyncingRef.current) {
// //           syncQueue();
// //         }
// //         wasOfflineRef.current = false;
// //       } else {
// //         wasOfflineRef.current = true;
// //       }
// //     }, 10000);

// //     return () => clearInterval(interval);
// //   }, []);

// //   const checkStatus = async () => {
// //     const online = await checkOnline();
// //     setIsOffline(!online);
// //     wasOfflineRef.current = !online;
// //     const count = await getQueueCount('multimodal');
// //     setPendingCount(count);
// //     if (online && count > 0) syncQueue();
// //   };

// //   const syncQueue = async () => {
// //     // Hard guard — if already syncing, do nothing
// //     if (isSyncingRef.current) return;

// //     const count = await getQueueCount('multimodal');
// //     if (!count) return;

// //     isSyncingRef.current = true;
// //     setIsSyncing(true);
// //     try {
// //       const done = await processQueue();
// //       if (done > 0) {
// //         Alert.alert('✅ Synced!', `${done} queued analysis(es) completed and saved to mood history.`);
// //       }
// //       setPendingCount(await getQueueCount('multimodal'));
// //     } catch (e) {
// //       console.error('syncQueue error:', e);
// //     } finally {
// //       isSyncingRef.current = false;
// //       setIsSyncing(false);
// //     }
// //   };

// //   const startAudioRecording = async () => {
// //     try {
// //       const { status } = await Audio.requestPermissionsAsync();
// //       if (status !== 'granted') { Alert.alert('Permission needed', 'Microphone access required.'); return; }
// //       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
// //       const recording = new Audio.Recording();
// //       await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
// //       await recording.startAsync();
// //       recordingRef.current = recording;
// //       setIsRecordingAudio(true);
// //     } catch { Alert.alert('Error', 'Could not start recording.'); }
// //   };

// //   const stopAudioRecording = async () => {
// //     if (!recordingRef.current) return;
// //     try {
// //       setIsRecordingAudio(false);
// //       await recordingRef.current.stopAndUnloadAsync();
// //       const uri = recordingRef.current.getURI();
// //       setAudioUri(uri);
// //       recordingRef.current = null;
// //     } catch { Alert.alert('Error', 'Could not stop recording.'); }
// //   };

// //   const takePhoto = async () => {
// //     try {
// //       const { status } = await ImagePicker.requestCameraPermissionsAsync();
// //       if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return; }
// //       const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
// //       if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
// //     } catch { Alert.alert('Error', 'Could not take photo.'); }
// //   };

// //   const pickImage = async () => {
// //     try {
// //       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //       if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access required.'); return; }
// //       const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
// //       if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
// //     } catch { Alert.alert('Error', 'Could not pick image.'); }
// //   };

// //   const analyzeMultimodal = async () => {
// //     const hasText  = text.trim().length > 0;
// //     const hasAudio = audioUri !== null;
// //     const hasImage = imageUri !== null;
// //     if (!hasText && !hasAudio && !hasImage) {
// //       Alert.alert('No Input', 'Please provide at least one input.');
// //       return;
// //     }

// //     const online = await checkOnline();
// //     setIsOffline(!online);

// //     if (!online) {
// //       const inputList = [hasText && 'text', hasAudio && 'audio', hasImage && 'image'].filter(Boolean).join(' + ');
// //       Alert.alert('📡 No Internet Connection', 'Your inputs will be saved and analyzed when you reconnect.', [
// //         {
// //           text: '💾 Save for Later',
// //           onPress: async () => {
// //             // Copy files from Expo cache → permanent storage before queuing
// //             const permAudioUri = hasAudio ? await copyToPermStorage(audioUri, 'audio') : null;
// //             const permImageUri = hasImage ? await copyToPermStorage(imageUri, 'image') : null;
// //             await addToQueue({
// //               type: 'multimodal',
// //               text: hasText ? text.trim() : null,
// //               audioUri: permAudioUri,
// //               imageUri: permImageUri,
// //             });
// //             setPendingCount(await getQueueCount('multimodal'));
// //             Alert.alert('✅ Saved!', `${inputList} inputs saved. Will auto-analyze when you reconnect.`);
// //           },
// //         },
// //         { text: '📝 Text Only (Offline)', onPress: () => navigation.navigate('TextAnalysis') },
// //         { text: 'Cancel', style: 'cancel' },
// //       ]);
// //       return;
// //     }

// //     setIsAnalyzing(true);
// //     setResults(null);
// //     setShowCrisisAlert(false);

// //     try {
// //       const formData = new FormData();
// //       if (hasText)  formData.append('text', text.trim());
// //       if (hasAudio) formData.append('audio_file', { uri: audioUri, type: 'audio/m4a', name: 'audio.m4a' });
// //       if (hasImage) formData.append('image_file', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });

// //       const response = await axios.post(`${API_BASE_URL}/analyze-multimodal`, formData, {
// //         headers: { 'Content-Type': 'multipart/form-data' },
// //         timeout: 60000,
// //       });

// //       if (response.data.status === 'success') {
// //         setResults(response.data.data);
// //         await saveMoodEntry(response.data.data, {
// //           inputText: hasText ? text.trim() : null,
// //           inputImageUri: hasImage ? imageUri : null,
// //           hasAudio,
// //         });
// //         if (response.data.data.wellness_score <= 3.0) setShowCrisisAlert(true);
// //       } else {
// //         Alert.alert('Error', 'Analysis failed. Please try again.');
// //       }
// //     } catch (error) {
// //       Alert.alert('Analysis Failed', 'Could not reach the server. Save your inputs for later?', [
// //         {
// //           text: '💾 Save for Later',
// //           onPress: async () => {
// //             const permAudioUri = hasAudio ? await copyToPermStorage(audioUri, 'audio') : null;
// //             const permImageUri = hasImage ? await copyToPermStorage(imageUri, 'image') : null;
// //             await addToQueue({
// //               type: 'multimodal',
// //               text: hasText ? text.trim() : null,
// //               audioUri: permAudioUri,
// //               imageUri: permImageUri,
// //             });
// //             setPendingCount(await getQueueCount('multimodal'));
// //             Alert.alert('✅ Saved!', 'Will auto-analyze when connection is restored.');
// //           },
// //         },
// //         { text: 'Dismiss', style: 'cancel' },
// //       ]);
// //     } finally { setIsAnalyzing(false); }
// //   };

// //   const resetScreen = () => {
// //     setText('');
// //     setAudioUri(null);
// //     setImageUri(null);
// //     setResults(null);
// //     setShowCrisisAlert(false);
// //   };

// //   // ── RESULTS ──────────────────────────────────────────────────────────────
// //   if (results) {
// //     const emotion           = results.emotion?.primary || 'unknown';
// //     const confidence        = results.emotion?.confidence || 0;
// //     const wellnessScore     = results.wellness_score || 5.0;
// //     const interpretation    = results.interpretation || '';
// //     const allProbs          = results.emotion?.all_probabilities || {};
// //     const modalities        = results.modalities_used || [];
// //     const individualResults = results.individual_results || {};
// //     const wColor = getWellnessColor(wellnessScore);

// //     return (
// //       <ScrollView style={styles.container}>
// //         <View style={styles.header}>
// //           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>
// //           <Text style={styles.headerTitle}>🔀 Multimodal Results</Text>
// //           <Text style={styles.headerSubtitle}>{modalities.length} modalities combined</Text>
// //         </View>
// //         <View style={styles.emotionCard}>
// //           <Text style={styles.emotionEmoji}>{getEmotionEmoji(emotion)}</Text>
// //           <Text style={styles.emotionLabel}>Fused Emotion</Text>
// //           <Text style={styles.emotionName}>{emotion.toUpperCase()}</Text>
// //           <Text style={styles.confidenceText}>Confidence: {(confidence * 100).toFixed(1)}%</Text>
// //           <View style={styles.modalitiesBadges}>
// //             {modalities.map((m, i) => (
// //               <View key={i} style={styles.modalityBadge}>
// //                 <Text style={styles.modalityBadgeText}>{m === 'text' ? '📝' : m === 'audio' ? '🎤' : '📷'} {m}</Text>
// //               </View>
// //             ))}
// //           </View>
// //         </View>
// //         <View style={styles.wellnessCard}>
// //           <Text style={styles.wellnessLabel}>Wellness Score</Text>
// //           <Text style={[styles.wellnessScore, { color: wColor }]}>{wellnessScore.toFixed(1)}/10</Text>
// //           <View style={styles.wellnessBar}><View style={[styles.wellnessFill, { width: `${(wellnessScore / 10) * 100}%`, backgroundColor: wColor }]} /></View>
// //           <Text style={styles.interpretationText}>{interpretation}</Text>
// //         </View>
// //         <View style={styles.individualCard}>
// //           <Text style={styles.probTitle}>Individual Results</Text>
// //           {individualResults.text && (
// //             <View style={styles.individualRow}>
// //               <Text style={styles.individualLabel}>📝 Text:</Text>
// //               <Text style={styles.individualEmotion}>{getEmotionEmoji(individualResults.text.emotion)} {individualResults.text.emotion}</Text>
// //               <Text style={styles.individualConf}>{(individualResults.text.confidence * 100).toFixed(0)}%</Text>
// //             </View>
// //           )}
// //           {individualResults.audio && (
// //             <View style={styles.individualRow}>
// //               <Text style={styles.individualLabel}>🎤 Audio:</Text>
// //               <Text style={styles.individualEmotion}>{getEmotionEmoji(individualResults.audio.emotion)} {individualResults.audio.emotion}</Text>
// //               <Text style={styles.individualConf}>{(individualResults.audio.confidence * 100).toFixed(0)}%</Text>
// //             </View>
// //           )}
// //           {individualResults.video && (
// //             <View style={styles.individualRow}>
// //               <Text style={styles.individualLabel}>📷 Photo:</Text>
// //               <Text style={styles.individualEmotion}>{getEmotionEmoji(individualResults.video.emotion)} {individualResults.video.emotion}</Text>
// //               <Text style={styles.individualConf}>{(individualResults.video.confidence * 100).toFixed(0)}%</Text>
// //             </View>
// //           )}
// //         </View>
// //         <View style={styles.probCard}>
// //           <Text style={styles.probTitle}>Fused Probabilities</Text>
// //           {Object.entries(allProbs).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
// //             <View key={emo} style={styles.probRow}>
// //               <Text style={styles.probLabel}>{getEmotionEmoji(emo)} {emo}</Text>
// //               <View style={styles.probBarContainer}><View style={[styles.probBar, { width: `${prob * 100}%` }]} /></View>
// //               <Text style={styles.probValue}>{(prob * 100).toFixed(1)}%</Text>
// //             </View>
// //           ))}
// //         </View>
// //         <TouchableOpacity style={styles.resetButton} onPress={resetScreen}><Text style={styles.resetButtonText}>Analyze Another</Text></TouchableOpacity>
// //         <View style={{ height: 30 }} />
// //         <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisisAlert(false)} />
// //       </ScrollView>
// //     );
// //   }

// //   // ── INPUT SCREEN ──────────────────────────────────────────────────────────
// //   return (
// //     <ScrollView style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>
// //         <Text style={styles.headerTitle}>🔀 Multimodal Analysis</Text>
// //         <Text style={styles.headerSubtitle}>Combine inputs for best accuracy</Text>
// //       </View>

// //       {isOffline && (
// //         <View style={styles.offlineBanner}>
// //           <Text style={styles.offlineIcon}>📡</Text>
// //           <Text style={styles.offlineText}>You're offline. Inputs will be saved and auto-analyzed when you reconnect.</Text>
// //         </View>
// //       )}

// //       {pendingCount > 0 && !isOffline && (
// //         <TouchableOpacity style={styles.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.8}>
// //           {isSyncing
// //             ? <View style={styles.syncRow}><ActivityIndicator size="small" color="white" /><Text style={styles.syncText}> Analyzing {pendingCount} saved input(s)…</Text></View>
// //             : <Text style={styles.syncText}>📬 {pendingCount} saved input(s) — Tap to analyze now</Text>}
// //         </TouchableOpacity>
// //       )}

// //       <View style={styles.inputSection}>
// //         <Text style={styles.sectionTitle}>📝 Text (Optional)</Text>
// //         <TextInput
// //           style={styles.textInput}
// //           placeholder="How are you feeling today?"
// //           value={text}
// //           onChangeText={setText}
// //           multiline
// //           numberOfLines={4}
// //         />
// //         {text.length > 0 && <Text style={styles.charCount}>{text.length} characters</Text>}
// //       </View>

// //       <View style={styles.inputSection}>
// //         <Text style={styles.sectionTitle}>🎙️ Audio (Optional)</Text>
// //         {!audioUri ? (
// //           <TouchableOpacity
// //             style={[styles.recordButton, isRecordingAudio && styles.recordingActiveButton]}
// //             onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
// //           >
// //             <Text style={styles.recordButtonText}>{isRecordingAudio ? '⏹ Stop Recording' : '🎙 Record Voice'}</Text>
// //           </TouchableOpacity>
// //         ) : (
// //           <View style={styles.filePreview}>
// //             <Text style={styles.filePreviewText}>✅ Audio recorded</Text>
// //             <TouchableOpacity onPress={() => setAudioUri(null)}><Text style={styles.removeText}>✕ Remove</Text></TouchableOpacity>
// //           </View>
// //         )}
// //       </View>

// //       <View style={styles.inputSection}>
// //         <Text style={styles.sectionTitle}>📷 Photo (Optional)</Text>
// //         {!imageUri ? (
// //           <View style={styles.optionsRow}>
// //             <TouchableOpacity style={styles.optionButton} onPress={takePhoto}><Text style={styles.optionButtonText}>📷 Take Photo</Text></TouchableOpacity>
// //             <TouchableOpacity style={styles.optionButton} onPress={pickImage}><Text style={styles.optionButtonText}>🖼 Pick Photo</Text></TouchableOpacity>
// //           </View>
// //         ) : (
// //           <View>
// //             <Image source={{ uri: imageUri }} style={styles.imagePreview} />
// //             <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
// //               <Text style={styles.removeImageButtonText}>✕ Remove Photo</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}
// //       </View>

// //       <View style={styles.analyzeSection}>
// //         {isAnalyzing ? (
// //           <View style={styles.analyzingContainer}>
// //             <ActivityIndicator size="large" color="#6C63FF" />
// //             <Text style={styles.analyzingText}>Fusing all inputs…</Text>
// //             <Text style={styles.analyzingSubText}>This may take up to 60 seconds</Text>
// //           </View>
// //         ) : (
// //           <TouchableOpacity style={styles.analyzeButton} onPress={analyzeMultimodal}>
// //             <Text style={styles.analyzeButtonText}>{isOffline ? '💾 Save for Later' : '🔀 Analyze All Inputs'}</Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       <View style={styles.tipBox}>
// //         <Text style={styles.tipTitle}>💡 How it works</Text>
// //         <Text style={styles.tipText}>• Provide 1, 2, or all 3 inputs</Text>
// //         <Text style={styles.tipText}>• AI fuses: 40% text · 30% audio · 30% photo</Text>
// //         <Text style={styles.tipText}>• More modalities = better accuracy</Text>
// //         <Text style={styles.tipText}>• Inputs saved automatically if you go offline</Text>
// //       </View>

// //       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisisAlert(false)} />
// //       <View style={{ height: 30 }} />
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F8F9FA' },
// //   header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 50 },
// //   backButton: { marginBottom: 10 },
// //   backButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
// //   headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
// //   headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
// //   offlineBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9800', marginHorizontal: 15, marginTop: 12, padding: 12, borderRadius: 10, gap: 8 },
// //   offlineIcon: { fontSize: 18 },
// //   offlineText: { flex: 1, color: 'white', fontSize: 13, fontWeight: '600' },
// //   syncBanner: { backgroundColor: '#6C63FF', marginHorizontal: 15, marginTop: 10, padding: 12, borderRadius: 10, alignItems: 'center' },
// //   syncRow: { flexDirection: 'row', alignItems: 'center' },
// //   syncText: { color: 'white', fontSize: 13, fontWeight: '600', textAlign: 'center' },
// //   inputSection: { backgroundColor: 'white', margin: 15, padding: 15, borderRadius: 12, elevation: 2 },
// //   sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
// //   textInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
// //   charCount: { fontSize: 12, color: '#999', marginTop: 5, textAlign: 'right' },
// //   recordButton: { backgroundColor: '#FF4444', padding: 15, borderRadius: 8, alignItems: 'center' },
// //   recordingActiveButton: { backgroundColor: '#333' },
// //   recordButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
// //   optionsRow: { flexDirection: 'row', gap: 10 },
// //   optionButton: { flex: 1, backgroundColor: '#6C63FF', padding: 15, borderRadius: 8, alignItems: 'center' },
// //   optionButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
// //   filePreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F8F0', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9' },
// //   filePreviewText: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
// //   removeText: { fontSize: 14, color: '#FF4444', fontWeight: 'bold' },
// //   imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
// //   removeImageButton: { backgroundColor: '#FF4444', padding: 10, borderRadius: 8, alignItems: 'center' },
// //   removeImageButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
// //   analyzeSection: { margin: 15 },
// //   analyzeButton: { backgroundColor: '#6C63FF', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 5 },
// //   analyzeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
// //   analyzingContainer: { alignItems: 'center', padding: 20 },
// //   analyzingText: { fontSize: 16, fontWeight: 'bold', color: '#6C63FF', marginTop: 15 },
// //   analyzingSubText: { fontSize: 13, color: '#999', marginTop: 5 },
// //   emotionCard: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 3 },
// //   emotionEmoji: { fontSize: 60, marginBottom: 10 },
// //   emotionLabel: { fontSize: 14, color: '#999', marginBottom: 5 },
// //   emotionName: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF', marginBottom: 5 },
// //   confidenceText: { fontSize: 14, color: '#666', marginBottom: 10 },
// //   modalitiesBadges: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
// //   modalityBadge: { backgroundColor: '#EDE7F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
// //   modalityBadgeText: { fontSize: 12, color: '#6C63FF', fontWeight: '600' },
// //   wellnessCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 16, elevation: 3 },
// //   wellnessLabel: { fontSize: 14, color: '#999', marginBottom: 5 },
// //   wellnessScore: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
// //   wellnessBar: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, marginBottom: 12, overflow: 'hidden' },
// //   wellnessFill: { height: '100%', borderRadius: 5 },
// //   interpretationText: { fontSize: 14, color: '#555', lineHeight: 20 },
// //   individualCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 16, elevation: 3 },
// //   individualRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
// //   individualLabel: { width: 80, fontSize: 13, color: '#666' },
// //   individualEmotion: { flex: 1, fontSize: 14, color: '#333', fontWeight: '600' },
// //   individualConf: { fontSize: 13, color: '#999' },
// //   probCard: { backgroundColor: 'white', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 16, elevation: 3 },
// //   probTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
// //   probRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
// //   probLabel: { width: 100, fontSize: 13, color: '#555' },
// //   probBarContainer: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
// //   probBar: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
// //   probValue: { width: 45, fontSize: 12, color: '#666', textAlign: 'right' },
// //   resetButton: { backgroundColor: '#6C63FF', marginHorizontal: 15, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 3, marginBottom: 10 },
// //   resetButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
// //   tipBox: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginHorizontal: 15, marginBottom: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6C63FF' },
// //   tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
// //   tipText: { fontSize: 13, color: '#666', marginBottom: 3 },
// // });

// // src/screens/MultimodalAnalysisScreen.js
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, TextInput,
//   ScrollView, Alert, ActivityIndicator, Image, StatusBar,
// } from 'react-native';
// import { Audio } from 'expo-av';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// import { saveMoodEntry } from '../utils/moodStorage';
// import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
// import CrisisAlert from '../components/CrisisAlert';
// import { C, getEmoji, getWellnessColor, getWellnessLabel } from '../theme';

// const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// const checkOnline = async () => {
//   try {
//     const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
//     return res.status === 204;
//   } catch { return false; }
// };

// const MODALITY_META = {
//   text:  { color: C.primary,      bg: C.primaryLight, label: 'Text' },
//   audio: { color: '#5BB8F5',       bg: '#E3F6FF',      label: 'Voice' },
//   image: { color: C.accentGreen,  bg: '#E3F9F5',      label: 'Photo' },
// };

// export default function MultimodalAnalysisScreen({ navigation }) {
//   const [text, setText]                       = useState('');
//   const [audioUri, setAudioUri]               = useState(null);
//   const [imageUri, setImageUri]               = useState(null);
//   const [isRecordingAudio, setIsRecordingAudio] = useState(false);
//   const [isAnalyzing, setIsAnalyzing]         = useState(false);
//   const [results, setResults]                 = useState(null);
//   const [showCrisisAlert, setShowCrisis]      = useState(false);
//   const [isOffline, setIsOffline]             = useState(false);
//   const [pendingCount, setPendingCount]       = useState(0);
//   const [isSyncing, setIsSyncing]             = useState(false);

//   const recordingRef  = useRef(null);
//   const isSyncingRef  = useRef(false);
//   const wasOfflineRef = useRef(false);

//   useEffect(() => {
//     checkStatus();
//     const interval = setInterval(async () => {
//       const online = await checkOnline();
//       setIsOffline(!online);
//       if (online) {
//         if (wasOfflineRef.current && !isSyncingRef.current) syncQueue();
//         wasOfflineRef.current = false;
//       } else { wasOfflineRef.current = true; }
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const checkStatus = async () => {
//     const online = await checkOnline();
//     setIsOffline(!online);
//     wasOfflineRef.current = !online;
//     const count = await getQueueCount('multimodal');
//     setPendingCount(count);
//     if (online && count > 0) syncQueue();
//   };

//   const syncQueue = async () => {
//     if (isSyncingRef.current) return;
//     const count = await getQueueCount('multimodal');
//     if (!count) return;
//     isSyncingRef.current = true; setIsSyncing(true);
//     try {
//       const done = await processQueue();
//       if (done > 0) Alert.alert('✅ Synced!', `${done} queued analysis completed.`);
//       setPendingCount(await getQueueCount('multimodal'));
//     } catch (e) { console.error('syncQueue error:', e); }
//     finally { isSyncingRef.current = false; setIsSyncing(false); }
//   };

//   const startAudioRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') { Alert.alert('Permission needed', 'Microphone access required.'); return; }
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const recording = new Audio.Recording();
//       await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       await recording.startAsync();
//       recordingRef.current = recording;
//       setIsRecordingAudio(true);
//     } catch { Alert.alert('Error', 'Could not start recording.'); }
//   };

//   const stopAudioRecording = async () => {
//     if (!recordingRef.current) return;
//     try {
//       setIsRecordingAudio(false);
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setAudioUri(uri);
//       recordingRef.current = null;
//     } catch { Alert.alert('Error', 'Could not stop recording.'); }
//   };

//   const takePhoto = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return; }
//       const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
//       if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
//     } catch { Alert.alert('Error', 'Could not take photo.'); }
//   };

//   const pickImage = async () => {
//     try {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access required.'); return; }
//       const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
//       if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
//     } catch { Alert.alert('Error', 'Could not pick image.'); }
//   };

//   const analyzeMultimodal = async () => {
//     const hasText = text.trim().length > 0;
//     const hasAudio = audioUri !== null;
//     const hasImage = imageUri !== null;
//     if (!hasText && !hasAudio && !hasImage) { Alert.alert('No Input', 'Please provide at least one input.'); return; }

//     const online = await checkOnline();
//     setIsOffline(!online);

//     if (!online) {
//       const inputList = [hasText && 'text', hasAudio && 'audio', hasImage && 'image'].filter(Boolean).join(' + ');
//       Alert.alert('No Internet', 'Save inputs and analyse when you reconnect?', [
//         { text: 'Save for Later', onPress: async () => {
//           const permAudioUri = hasAudio ? await copyToPermStorage(audioUri, 'audio') : null;
//           const permImageUri = hasImage ? await copyToPermStorage(imageUri, 'image') : null;
//           await addToQueue({ type: 'multimodal', text: hasText ? text.trim() : null, audioUri: permAudioUri, imageUri: permImageUri });
//           setPendingCount(await getQueueCount('multimodal'));
//           Alert.alert('Saved!', `${inputList} inputs saved.`);
//         }},
//         { text: 'Text Only (Offline)', onPress: () => navigation.navigate('TextAnalysis') },
//         { text: 'Cancel', style: 'cancel' },
//       ]);
//       return;
//     }

//     setIsAnalyzing(true); setResults(null); setShowCrisis(false);
//     try {
//       const formData = new FormData();
//       if (hasText)  formData.append('text', text.trim());
//       if (hasAudio) formData.append('audio_file', { uri: audioUri, type: 'audio/m4a', name: 'audio.m4a' });
//       if (hasImage) formData.append('image_file', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });

//       const response = await axios.post(`${API_BASE_URL}/analyze-multimodal`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
//       });

//       if (response.data.status === 'success') {
//         setResults(response.data.data);
//         await saveMoodEntry(response.data.data, { inputText: hasText ? text.trim() : null, inputImageUri: hasImage ? imageUri : null, hasAudio });
//         if (response.data.data.wellness_score <= 3.0) setShowCrisis(true);
//       } else { Alert.alert('Error', 'Analysis failed. Please try again.'); }
//     } catch (error) {
//       Alert.alert('Analysis Failed', 'Could not reach the server. Save inputs for later?', [
//         { text: 'Save for Later', onPress: async () => {
//           const permAudioUri = hasAudio ? await copyToPermStorage(audioUri, 'audio') : null;
//           const permImageUri = hasImage ? await copyToPermStorage(imageUri, 'image') : null;
//           await addToQueue({ type: 'multimodal', text: hasText ? text.trim() : null, audioUri: permAudioUri, imageUri: permImageUri });
//           setPendingCount(await getQueueCount('multimodal'));
//           Alert.alert('Saved!', 'Will auto-analyse when connection is restored.');
//         }},
//         { text: 'Dismiss', style: 'cancel' },
//       ]);
//     } finally { setIsAnalyzing(false); }
//   };

//   const resetScreen = () => { setText(''); setAudioUri(null); setImageUri(null); setResults(null); setShowCrisis(false); };

//   const hasAny = text.trim().length > 0 || audioUri || imageUri;

//   // ── RESULTS ───────────────────────────────────────────────────────────────
//   if (results) {
//     const emotion        = results.emotion?.primary || 'unknown';
//     const confidence     = results.emotion?.confidence || 0;
//     const wellnessScore  = results.wellness_score || 5.0;
//     const interpretation = results.interpretation || '';
//     const allProbs       = results.emotion?.all_probabilities || {};
//     const modalities     = results.modalities_used || [];
//     const indiv          = results.individual_results || {};
//     const wc             = getWellnessColor(wellnessScore);

//     return (
//       <View style={s.root}>
//         <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <View style={s.header}>
//             <View style={s.decor} />
//             <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
//             <Text style={s.headerTitle}>Multimodal Results</Text>
//             <Text style={s.headerSub}>{modalities.length} modalities combined</Text>
//           </View>
//           <View style={s.body}>
//             {/* Hero */}
//             <View style={[s.resultHero, { borderTopColor: wc }]}>
//               <Text style={{ fontSize: 54, marginBottom: 8 }}>{getEmoji(emotion)}</Text>
//               <Text style={s.resultEmo}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
//               <Text style={s.resultConf}>{(confidence * 100).toFixed(1)}% confidence</Text>
//               <View style={s.modalBadges}>
//                 {modalities.map((m, i) => {
//                   const meta = MODALITY_META[m] || MODALITY_META.text;
//                   return (
//                     <View key={i} style={[s.modalBadge, { backgroundColor: meta.bg }]}>
//                       <Text style={[s.modalBadgeTxt, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* Wellness */}
//             <View style={s.card}>
//               <Text style={s.cardLbl}>Wellness Score</Text>
//               <View style={s.wRow}>
//                 <Text style={[s.wBig, { color: wc }]}>{wellnessScore.toFixed(1)}</Text>
//                 <Text style={s.wOf}>/10</Text>
//                 <View style={[s.wTag, { borderColor: wc }]}><Text style={[s.wTagTxt, { color: wc }]}>{getWellnessLabel(wellnessScore)}</Text></View>
//               </View>
//               <View style={s.bar}><View style={[s.barFill, { width: `${(wellnessScore / 10) * 100}%`, backgroundColor: wc }]} /></View>
//               <Text style={s.interp}>{interpretation}</Text>
//             </View>

//             {/* Individual results */}
//             {(indiv.text || indiv.audio || indiv.image) && (
//               <View style={s.card}>
//                 <Text style={s.cardLbl}>Per-Modality Breakdown</Text>
//                 {['text', 'audio', 'image'].map(mod => {
//                   if (!indiv[mod]) return null;
//                   const meta = MODALITY_META[mod];
//                   return (
//                     <View key={mod} style={[s.indivRow, { backgroundColor: meta.bg }]}>
//                       <Text style={{ fontSize: 18 }}>{meta.icon}</Text>
//                       <View style={{ flex: 1, marginLeft: 10 }}>
//                         <Text style={[s.indivLabel, { color: meta.color }]}>{meta.label}</Text>
//                         <Text style={s.indivEmo}>{getEmoji(indiv[mod].emotion)}  {indiv[mod].emotion?.charAt(0).toUpperCase() + indiv[mod].emotion?.slice(1)}</Text>
//                       </View>
//                       <Text style={[s.indivConf, { color: meta.color }]}>{(indiv[mod].confidence * 100).toFixed(0)}%</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* Fused emotion breakdown */}
//             {Object.keys(allProbs).length > 0 && (
//               <View style={s.card}>
//                 <Text style={s.cardLbl}>Fused Emotion Breakdown</Text>
//                 {Object.entries(allProbs).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
//                   <View key={emo} style={s.probRow}>
//                     <Text style={s.probLbl}>{getEmoji(emo)}  {emo.charAt(0).toUpperCase() + emo.slice(1)}</Text>
//                     <View style={s.probWrap}><View style={[s.probFill, { width: `${prob * 100}%`, backgroundColor: C.primary }]} /></View>
//                     <Text style={[s.probPct, { color: C.primary }]}>{(prob * 100).toFixed(0)}%</Text>
//                   </View>
//                 ))}
//               </View>
//             )}

//             <TouchableOpacity style={s.bigBtn} onPress={resetScreen} activeOpacity={0.85}>
//               <Text style={s.bigBtnTxt}>Analyse Again</Text>
//             </TouchableOpacity>
//             <View style={{ height: 32 }} />
//           </View>
//         </ScrollView>
//         <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//       </View>
//     );
//   }

//   // ── INPUT SCREEN ──────────────────────────────────────────────────────────
//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//       <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

//         <View style={s.header}>
//           <View style={s.decor} />
//           <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
//           <Text style={s.headerTitle}>Multimodal Analysis</Text>
//           <Text style={s.headerSub}>Combine text, voice and photo for deeper insight</Text>
//         </View>

//         {isOffline && (
//           <View style={s.offlineBanner}><Text style={s.bannerTxt}>Offline — inputs saved, auto-analysed on reconnect</Text></View>
//         )}
//         {pendingCount > 0 && !isOffline && (
//           <TouchableOpacity style={s.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
//             {isSyncing
//               ? <View style={s.syncRow}><ActivityIndicator size="small" color="#fff" /><Text style={s.syncTxt}>  Syncing {pendingCount} queued analysis…</Text></View>
//               : <Text style={s.syncTxt}>{pendingCount} queued — Tap to analyse now</Text>}
//           </TouchableOpacity>
//         )}

//         <View style={s.body}>
//           {/* Progress chips */}
//           <View style={s.progressRow}>
//             {Object.entries(MODALITY_META).map(([mod, meta]) => {
//               const active = (mod === 'text' && text.trim().length > 0) || (mod === 'audio' && audioUri) || (mod === 'image' && imageUri);
//               return (
//                 <View key={mod} style={[s.chip, { backgroundColor: active ? meta.bg : C.bg, borderColor: active ? meta.color : C.border }]}>
//                   <Text style={{ fontSize: 14 }}>{meta.icon}</Text>
//                   <Text style={[s.chipTxt, { color: active ? meta.color : C.textLight }]}>{meta.label}</Text>
//                   {active && <Text style={[s.chipTxt, { color: meta.color }]}>  ✓</Text>}
//                 </View>
//               );
//             })}
//           </View>

//           {/* Text input */}
//           <View style={s.inputCard}>
//             <Text style={s.sectionLbl}>Text</Text>
//             <TextInput
//               style={s.input}
//               placeholder="How are you feeling? Describe your day…"
//               placeholderTextColor={C.textLight}
//               value={text}
//               onChangeText={setText}
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />
//           </View>

//           {/* Audio input */}
//           <View style={s.inputCard}>
//             <Text style={s.sectionLbl}>Voice Recording</Text>
//             {audioUri ? (
//               <View style={s.capturedRow}>
//                 <View style={[s.capturedBadge, { backgroundColor: '#E3F6FF' }]}>
//                   <Text style={{ color: '#5BB8F5', fontWeight: '700', fontSize: 13 }}>Recording captured</Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setAudioUri(null)}>
//                   <Text style={s.removeTxt}>Remove</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={[s.mediaBtn, { backgroundColor: isRecordingAudio ? '#FFF0EE' : C.primaryLight, borderColor: isRecordingAudio ? C.accentRed : C.primary }]}
//                 onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
//                 activeOpacity={0.85}
//               >
//                 <Text style={{ fontSize: 20 }}>{isRecordingAudio ? '⏹' : ''}</Text>
//                 <Text style={[s.mediaBtnTxt, { color: isRecordingAudio ? C.accentRed : C.primary }]}>
//                   {isRecordingAudio ? 'Stop Recording' : 'Start Recording'}
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Photo input */}
//           <View style={s.inputCard}>
//             <Text style={s.sectionLbl}>Photo</Text>
//             {imageUri ? (
//               <View style={s.capturedRow}>
//                 <Image source={{ uri: imageUri }} style={s.thumbnail} resizeMode="cover" />
//                 <TouchableOpacity onPress={() => setImageUri(null)} style={s.removeBtn}>
//                   <Text style={s.removeTxt}>Remove</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <View style={s.photoRow}>
//                 <TouchableOpacity style={[s.mediaBtn, { flex: 1 }]} onPress={takePhoto} activeOpacity={0.85}>
//                   {/* <Text style={{ fontSize: 18 }}>📷</Text> */}
//                   <Text style={s.mediaBtnTxt}>Camera</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[s.mediaBtn, { flex: 1 }]} onPress={pickImage} activeOpacity={0.85}>
//                   {/* <Text style={{ fontSize: 18 }}>🖼️</Text> */}
//                   <Text style={s.mediaBtnTxt}>Gallery</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Analyse button */}
//           {isAnalyzing ? (
//             <View style={s.loadCard}>
//               <ActivityIndicator size="large" color={C.primary} />
//               <Text style={s.loadTxt}>Combining all inputs…</Text>
//               <Text style={s.loadSub}>This may take up to 60 seconds</Text>
//             </View>
//           ) : (
//             <TouchableOpacity
//               style={[s.bigBtn, !hasAny && s.bigBtnDisabled]}
//               onPress={analyzeMultimodal}
//               disabled={!hasAny}
//               activeOpacity={0.85}
//             >
//               <Text style={s.bigBtnTxt}>Analyse Now</Text>
//             </TouchableOpacity>
//           )}

//           <View style={s.tips}>
//             <Text style={s.tipTitle}>💡  Tips</Text>
//             <Text style={s.tip}>• Use at least 2 inputs for best accuracy</Text>
//             <Text style={s.tip}>• Text + Voice is the most powerful combination</Text>
//             <Text style={s.tip}>• Ensure good lighting for photo analysis</Text>
//           </View>
//           <View style={{ height: 32 }} />
//         </View>
//       </ScrollView>
//       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:           { flex: 1, backgroundColor: C.bg },
//   scroll:         { flex: 1 },
//   header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
//   decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:        { marginBottom: 10 },
//   backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
//   offlineBanner:  { backgroundColor: C.accentOrange, padding: 11, paddingHorizontal: 16 },
//   bannerTxt:      { color: '#fff', fontSize: 12, fontWeight: '600' },
//   syncBanner:     { backgroundColor: C.primaryDark, padding: 11, paddingHorizontal: 16 },
//   syncRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   syncTxt:        { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
//   body:           { padding: 16 },
//   progressRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
//   chip:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 20, paddingVertical: 7, borderWidth: 1.5 },
//   chipTxt:        { fontSize: 11, fontWeight: '700' },
//   inputCard:      { backgroundColor: C.card, borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
//   sectionLbl:     { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 10 },
//   input:          { fontSize: 14, color: C.text, lineHeight: 22, minHeight: 80 },
//   mediaBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12, backgroundColor: C.primaryLight, borderWidth: 1.5, borderColor: C.primary },
//   mediaBtnTxt:    { fontSize: 13, fontWeight: '700', color: C.primary },
//   capturedRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   capturedBadge:  { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
//   removeTxt:      { fontSize: 12, color: C.accentRed, fontWeight: '700' },
//   photoRow:       { flexDirection: 'row', gap: 10 },
//   thumbnail:      { width: 70, height: 70, borderRadius: 12 },
//   removeBtn:      { justifyContent: 'center' },
//   loadCard:       { alignItems: 'center', padding: 30 },
//   loadTxt:        { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
//   loadSub:        { marginTop: 4, fontSize: 12, color: C.textLight },
//   bigBtn:         { backgroundColor: C.primary, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 12, elevation: 2 },
//   bigBtnDisabled: { backgroundColor: C.border },
//   bigBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '700' },
//   tips:           { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
//   tipTitle:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
//   tip:            { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
//   resultHero:     { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
//   resultEmo:      { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 4 },
//   resultConf:     { fontSize: 13, color: C.textMid, marginBottom: 12 },
//   modalBadges:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
//   modalBadge:     { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
//   modalBadgeTxt:  { fontSize: 12, fontWeight: '700' },
//   card:           { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
//   cardLbl:        { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
//   wRow:           { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
//   wBig:           { fontSize: 40, fontWeight: '700' },
//   wOf:            { fontSize: 20, color: C.textLight },
//   wTag:           { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
//   wTagTxt:        { fontSize: 12, fontWeight: '600' },
//   bar:            { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
//   barFill:        { height: '100%', borderRadius: 4 },
//   interp:         { fontSize: 14, color: C.textMid, lineHeight: 22, marginTop: 10 },
//   indivRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8 },
//   indivLabel:     { fontSize: 11, fontWeight: '700' },
//   indivEmo:       { fontSize: 13, color: C.text, fontWeight: '600', marginTop: 2 },
//   indivConf:      { fontSize: 14, fontWeight: '700' },
//   probRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   probLbl:        { width: 120, fontSize: 12, color: C.text },
//   probWrap:       { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
//   probFill:       { height: '100%', borderRadius: 4 },
//   probPct:        { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
// });

// src/screens/MultimodalAnalysisScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Image, StatusBar,
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { saveMoodEntry } from '../utils/moodStorage';
import { addToQueue, getQueueCount, processQueue, copyToPermStorage } from '../utils/offlineQueue';
import CrisisAlert from '../components/CrisisAlert';
import { C, getEmotionIcon, getWellnessColor, getWellnessLabel } from '../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

const checkOnline = async () => {
  try {
    const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
    return res.status === 204;
  } catch { return false; }
};

const MODALITY_META = {
  text:  { icon: 'text-box-edit-outline', color: C.primary,     bg: C.primaryLight, label: 'Text' },
  audio: { icon: 'microphone-outline',    color: '#5BB8F5',      bg: '#E3F6FF',      label: 'Voice' },
  image: { icon: 'image-outline',         color: C.accentGreen,  bg: '#E3F9F5',      label: 'Photo' },
};

export default function MultimodalAnalysisScreen({ navigation }) {
  const [text, setText]                         = useState('');
  const [audioUri, setAudioUri]                 = useState(null);
  const [imageUri, setImageUri]                 = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [results, setResults]                   = useState(null);
  const [showCrisisAlert, setShowCrisis]        = useState(false);
  const [isOffline, setIsOffline]               = useState(false);
  const [pendingCount, setPendingCount]         = useState(0);
  const [isSyncing, setIsSyncing]               = useState(false);

  const recordingRef  = useRef(null);
  const isSyncingRef  = useRef(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(async () => {
      const online = await checkOnline();
      setIsOffline(!online);
      if (online) {
        if (wasOfflineRef.current && !isSyncingRef.current) syncQueue();
        wasOfflineRef.current = false;
      } else { wasOfflineRef.current = true; }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const online = await checkOnline(); setIsOffline(!online); wasOfflineRef.current = !online;
    const count = await getQueueCount('multimodal'); setPendingCount(count);
    if (online && count > 0) syncQueue();
  };

  const syncQueue = async () => {
    if (isSyncingRef.current) return;
    const count = await getQueueCount('multimodal'); if (!count) return;
    isSyncingRef.current = true; setIsSyncing(true);
    try {
      const done = await processQueue();
      if (done > 0) Alert.alert('Synced', `${done} queued analysis completed.`);
      setPendingCount(await getQueueCount('multimodal'));
    } catch (e) { console.error('syncQueue error:', e); }
    finally { isSyncingRef.current = false; setIsSyncing(false); }
  };

  const startAudioRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Microphone access required.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording; setIsRecordingAudio(true);
    } catch { Alert.alert('Error', 'Could not start recording.'); }
  };

  const stopAudioRecording = async () => {
    if (!recordingRef.current) return;
    try {
      setIsRecordingAudio(false);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI(); setAudioUri(uri); recordingRef.current = null;
    } catch { Alert.alert('Error', 'Could not stop recording.'); }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return; }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
    } catch { Alert.alert('Error', 'Could not take photo.'); }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access required.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
    } catch { Alert.alert('Error', 'Could not pick image.'); }
  };

  const analyzeMultimodal = async () => {
    const hasText = text.trim().length > 0; const hasAudio = !!audioUri; const hasImage = !!imageUri;
    if (!hasText && !hasAudio && !hasImage) { Alert.alert('No Input', 'Please provide at least one input.'); return; }
    const online = await checkOnline(); setIsOffline(!online);
    if (!online) {
      const inputList = [hasText && 'text', hasAudio && 'audio', hasImage && 'image'].filter(Boolean).join(' + ');
      Alert.alert('No Internet', 'Save inputs and analyse when you reconnect?', [
        { text: 'Save for Later', onPress: async () => {
          const permAudioUri = hasAudio ? await copyToPermStorage(audioUri, 'audio') : null;
          const permImageUri = hasImage ? await copyToPermStorage(imageUri, 'image') : null;
          await addToQueue({ type: 'multimodal', text: hasText ? text.trim() : null, audioUri: permAudioUri, imageUri: permImageUri });
          setPendingCount(await getQueueCount('multimodal'));
          Alert.alert('Saved', `${inputList} inputs saved.`);
        }},
        { text: 'Text Only', onPress: () => navigation.navigate('TextAnalysis') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setIsAnalyzing(true); setResults(null); setShowCrisis(false);
    try {
      const formData = new FormData();
      if (hasText)  formData.append('text', text.trim());
      if (hasAudio) formData.append('audio_file', { uri: audioUri, type: 'audio/m4a', name: 'audio.m4a' });
      if (hasImage) formData.append('image_file', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
      const response = await axios.post(`${API_BASE_URL}/analyze-multimodal`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
      });
      if (response.data.status === 'success') {
        setResults(response.data.data);
        await saveMoodEntry(response.data.data, { inputText: hasText ? text.trim() : null, inputImageUri: hasImage ? imageUri : null, hasAudio });
        if (response.data.data.wellness_score <= 3.0) setShowCrisis(true);
      } else { Alert.alert('Error', 'Analysis failed. Please try again.'); }
    } catch {
      Alert.alert('Analysis Failed', 'Save inputs for later?', [
        { text: 'Save for Later', onPress: async () => {
          const hasAudio2 = !!audioUri; const hasImage2 = !!imageUri; const hasText2 = text.trim().length > 0;
          const permAudioUri = hasAudio2 ? await copyToPermStorage(audioUri, 'audio') : null;
          const permImageUri = hasImage2 ? await copyToPermStorage(imageUri, 'image') : null;
          await addToQueue({ type: 'multimodal', text: hasText2 ? text.trim() : null, audioUri: permAudioUri, imageUri: permImageUri });
          setPendingCount(await getQueueCount('multimodal'));
          Alert.alert('Saved', 'Will auto-analyse when connection is restored.');
        }},
        { text: 'Dismiss', style: 'cancel' },
      ]);
    } finally { setIsAnalyzing(false); }
  };

  const resetScreen = () => { setText(''); setAudioUri(null); setImageUri(null); setResults(null); setShowCrisis(false); };
  const hasAny = text.trim().length > 0 || audioUri || imageUri;

  // ── Results ────────────────────────────────────────────────────────────────
  if (results) {
    const emotion = results.emotion?.primary || 'unknown';
    const confidence = results.emotion?.confidence || 0;
    const wellnessScore = results.wellness_score || 5.0;
    const interpretation = results.interpretation || '';
    const allProbs = results.emotion?.all_probabilities || {};
    const modalities = results.modalities_used || [];
    const indiv = results.individual_results || {};
    const wc = getWellnessColor(wellnessScore);

    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View style={s.decor} />
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Multimodal Results</Text>
            <Text style={s.headerSub}>{modalities.length} modalities combined</Text>
          </View>
          <View style={s.body}>
            <View style={[s.resultHero, { borderTopColor: wc }]}>
              <Icon name={getEmotionIcon(emotion)} size={56} color={wc} />
              <Text style={s.resultEmo}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
              <Text style={s.resultConf}>{(confidence * 100).toFixed(1)}% confidence</Text>
              <View style={s.modalBadges}>
                {modalities.map((m, i) => {
                  const meta = MODALITY_META[m] || MODALITY_META.text;
                  return (
                    <View key={i} style={[s.modalBadge, { backgroundColor: meta.bg }]}>
                      <Icon name={meta.icon} size={12} color={meta.color} />
                      <Text style={[s.modalBadgeTxt, { color: meta.color }]}> {meta.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardLbl}>Wellness Score</Text>
              <View style={s.wRow}>
                <Text style={[s.wBig, { color: wc }]}>{wellnessScore.toFixed(1)}</Text>
                <Text style={s.wOf}>/10</Text>
                <View style={[s.wTag, { borderColor: wc }]}><Text style={[s.wTagTxt, { color: wc }]}>{getWellnessLabel(wellnessScore)}</Text></View>
              </View>
              <View style={s.bar}><View style={[s.barFill, { width: `${(wellnessScore / 10) * 100}%`, backgroundColor: wc }]} /></View>
              <Text style={s.interp}>{interpretation}</Text>
            </View>

            {(indiv.text || indiv.audio || indiv.image) && (
              <View style={s.card}>
                <Text style={s.cardLbl}>Per-Modality Breakdown</Text>
                {['text', 'audio', 'image'].map(mod => {
                  if (!indiv[mod]) return null;
                  const meta = MODALITY_META[mod];
                  return (
                    <View key={mod} style={[s.indivRow, { backgroundColor: meta.bg }]}>
                      <Icon name={meta.icon} size={18} color={meta.color} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[s.indivLabel, { color: meta.color }]}>{meta.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Icon name={getEmotionIcon(indiv[mod].emotion)} size={14} color={meta.color} />
                          <Text style={s.indivEmo}>  {indiv[mod].emotion?.charAt(0).toUpperCase() + indiv[mod].emotion?.slice(1)}</Text>
                        </View>
                      </View>
                      <Text style={[s.indivConf, { color: meta.color }]}>{(indiv[mod].confidence * 100).toFixed(0)}%</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {Object.keys(allProbs).length > 0 && (
              <View style={s.card}>
                <Text style={s.cardLbl}>Fused Emotion Breakdown</Text>
                {Object.entries(allProbs).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
                  <View key={emo} style={s.probRow}>
                    <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
                    <Text style={s.probLbl}>  {emo.charAt(0).toUpperCase() + emo.slice(1)}</Text>
                    <View style={s.probWrap}><View style={[s.probFill, { width: `${prob * 100}%`, backgroundColor: C.primary }]} /></View>
                    <Text style={[s.probPct, { color: C.primary }]}>{(prob * 100).toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={s.bigBtn} onPress={resetScreen} activeOpacity={0.85}>
              <Icon name="shuffle-variant" size={18} color="#fff" />
              <Text style={s.bigBtnTxt}> Analyse Again</Text>
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
        <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
      </View>
    );
  }

  // ── Input screen ───────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View style={s.decor} />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Multimodal Analysis</Text>
          <Text style={s.headerSub}>Combine text, voice and photo for deeper insight</Text>
        </View>

        {isOffline && (
          <View style={s.offlineBanner}>
            <Icon name="wifi-off" size={16} color="#fff" />
            <Text style={s.bannerTxt}> Offline — inputs saved, auto-analysed on reconnect</Text>
          </View>
        )}
        {pendingCount > 0 && !isOffline && (
          <TouchableOpacity style={s.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
            <View style={s.syncRow}>
              {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="cloud-sync" size={16} color="#fff" />}
              <Text style={s.syncTxt}>  {isSyncing ? `Syncing ${pendingCount} queued analysis…` : `${pendingCount} queued — Tap to analyse`}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={s.body}>
          {/* Progress chips */}
          <View style={s.progressRow}>
            {Object.entries(MODALITY_META).map(([mod, meta]) => {
              const active = (mod === 'text' && text.trim().length > 0) || (mod === 'audio' && audioUri) || (mod === 'image' && imageUri);
              return (
                <View key={mod} style={[s.chip, { backgroundColor: active ? meta.bg : C.bg, borderColor: active ? meta.color : C.border }]}>
                  <Icon name={meta.icon} size={14} color={active ? meta.color : C.textLight} />
                  <Text style={[s.chipTxt, { color: active ? meta.color : C.textLight }]}> {meta.label}</Text>
                  {active && <Icon name="check-circle" size={12} color={meta.color} />}
                </View>
              );
            })}
          </View>

          {/* Text */}
          <View style={s.inputCard}>
            <View style={s.sectionLblRow}>
              <Icon name="text-box-edit-outline" size={14} color={C.textMid} />
              <Text style={s.sectionLbl}> Text</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="How are you feeling? Describe your day…"
              placeholderTextColor={C.textLight}
              value={text} onChangeText={setText}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </View>

          {/* Audio */}
          <View style={s.inputCard}>
            <View style={s.sectionLblRow}>
              <Icon name="microphone-outline" size={14} color={C.textMid} />
              <Text style={s.sectionLbl}> Voice Recording</Text>
            </View>
            {audioUri ? (
              <View style={s.capturedRow}>
                <View style={[s.capturedBadge, { backgroundColor: '#E3F6FF' }]}>
                  <Icon name="microphone-outline" size={14} color="#5BB8F5" />
                  <Text style={{ color: '#5BB8F5', fontWeight: '700', fontSize: 13 }}> Recording captured</Text>
                </View>
                <TouchableOpacity onPress={() => setAudioUri(null)}>
                  <Text style={s.removeTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[s.mediaBtn, { backgroundColor: isRecordingAudio ? '#FFF0EE' : C.primaryLight, borderColor: isRecordingAudio ? C.accentRed : C.primary }]}
                onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                activeOpacity={0.85}
              >
                <Icon name={isRecordingAudio ? 'stop-circle' : 'microphone'} size={20} color={isRecordingAudio ? C.accentRed : C.primary} />
                <Text style={[s.mediaBtnTxt, { color: isRecordingAudio ? C.accentRed : C.primary }]}>
                  {' '}{isRecordingAudio ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo */}
          <View style={s.inputCard}>
            <View style={s.sectionLblRow}>
              <Icon name="image-outline" size={14} color={C.textMid} />
              <Text style={s.sectionLbl}> Photo</Text>
            </View>
            {imageUri ? (
              <View style={s.capturedRow}>
                <Image source={{ uri: imageUri }} style={s.thumbnail} resizeMode="cover" />
                <TouchableOpacity onPress={() => setImageUri(null)} style={{ justifyContent: 'center' }}>
                  <Text style={s.removeTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.photoRow}>
                <TouchableOpacity style={[s.mediaBtn, { flex: 1 }]} onPress={takePhoto} activeOpacity={0.85}>
                  <Icon name="camera" size={18} color={C.primary} />
                  <Text style={s.mediaBtnTxt}> Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.mediaBtn, { flex: 1 }]} onPress={pickImage} activeOpacity={0.85}>
                  <Icon name="image-multiple" size={18} color={C.primary} />
                  <Text style={s.mediaBtnTxt}> Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isAnalyzing ? (
            <View style={s.loadCard}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={s.loadTxt}>Combining all inputs…</Text>
              <Text style={s.loadSub}>This may take up to 60 seconds</Text>
            </View>
          ) : (
            <TouchableOpacity style={[s.bigBtn, !hasAny && s.bigBtnDisabled]} onPress={analyzeMultimodal} disabled={!hasAny} activeOpacity={0.85}>
              <Icon name="magnify" size={18} color="#fff" />
              <Text style={s.bigBtnTxt}> Analyse Now</Text>
            </TouchableOpacity>
          )}

          <View style={s.tips}>
            <View style={s.tipsTitle}>
              <Icon name="lightbulb-outline" size={14} color={C.text} />
              <Text style={s.tipsTitleTxt}> Tips</Text>
            </View>
            <Text style={s.tip}>• Use at least 2 inputs for best accuracy</Text>
            <Text style={s.tip}>• Text + Voice is the most powerful combination</Text>
            <Text style={s.tip}>• Ensure good lighting for photo analysis</Text>
          </View>
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
      <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  scroll:         { flex: 1 },
  header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
  decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
  backBtn:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  offlineBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentOrange, padding: 11, paddingHorizontal: 16 },
  bannerTxt:      { color: '#fff', fontSize: 12, fontWeight: '600' },
  syncBanner:     { backgroundColor: C.primaryDark, padding: 11, paddingHorizontal: 16 },
  syncRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  syncTxt:        { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  body:           { padding: 16 },
  progressRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 20, paddingVertical: 7, borderWidth: 1.5 },
  chipTxt:        { fontSize: 11, fontWeight: '700' },
  inputCard:      { backgroundColor: C.card, borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2 },
  sectionLblRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionLbl:     { fontSize: 13, fontWeight: '700', color: C.textMid },
  input:          { fontSize: 14, color: C.text, lineHeight: 22, minHeight: 80 },
  mediaBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 12, borderWidth: 1.5 },
  mediaBtnTxt:    { fontSize: 13, fontWeight: '700', color: C.primary },
  capturedRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capturedBadge:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  removeTxt:      { fontSize: 12, color: C.accentRed, fontWeight: '700' },
  photoRow:       { flexDirection: 'row', gap: 10 },
  thumbnail:      { width: 70, height: 70, borderRadius: 12 },
  loadCard:       { alignItems: 'center', padding: 30 },
  loadTxt:        { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
  loadSub:        { marginTop: 4, fontSize: 12, color: C.textLight },
  bigBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 15, marginBottom: 12, elevation: 2 },
  bigBtnDisabled: { backgroundColor: C.border },
  bigBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  tips:           { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.primary },
  tipsTitle:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipsTitleTxt:   { fontSize: 13, fontWeight: '700', color: C.text },
  tip:            { fontSize: 12, color: C.textMid, marginBottom: 4, lineHeight: 19 },
  resultHero:     { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, gap: 6 },
  resultEmo:      { fontSize: 26, fontWeight: '700', color: C.text },
  resultConf:     { fontSize: 13, color: C.textMid },
  modalBadges:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  modalBadge:     { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  modalBadgeTxt:  { fontSize: 12, fontWeight: '700' },
  card:           { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2 },
  cardLbl:        { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
  wRow:           { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
  wBig:           { fontSize: 40, fontWeight: '700' },
  wOf:            { fontSize: 20, color: C.textLight },
  wTag:           { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  wTagTxt:        { fontSize: 12, fontWeight: '600' },
  bar:            { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
  barFill:        { height: '100%', borderRadius: 4 },
  interp:         { fontSize: 14, color: C.textMid, lineHeight: 22, marginTop: 10 },
  indivRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8 },
  indivLabel:     { fontSize: 11, fontWeight: '700' },
  indivEmo:       { fontSize: 13, color: C.text, fontWeight: '600' },
  indivConf:      { fontSize: 14, fontWeight: '700' },
  probRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  probLbl:        { fontSize: 12, color: C.text, width: 110 },
  probWrap:       { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probFill:       { height: '100%', borderRadius: 4 },
  probPct:        { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
});