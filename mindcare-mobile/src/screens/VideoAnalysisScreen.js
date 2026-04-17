// // src/screens/VideoAnalysisScreen.js
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ScrollView,
//   Alert, ActivityIndicator, Image, StatusBar,
// } from 'react-native';
// import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import { VideoView, useVideoPlayer } from 'expo-video';
// import axios from 'axios';
// import { saveMoodEntry } from '../utils/moodStorage';
// import { addToQueue, getQueueCount, processQueue } from '../utils/offlineQueue';
// import CrisisAlert from '../components/CrisisAlert';
// import { C, getEmotionIcon, getWellnessColor, getWellnessLabel } from '../theme';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// const API_BASE_URL = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// const checkOnline = async () => {
//   try {
//     const res = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
//     return res.status === 204;
//   } catch { return false; }
// };

// export default function VideoAnalysisScreen({ navigation }) {
//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
//   const [micPermission, requestMicPermission]       = useMicrophonePermissions();
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [capturedVideo, setCapturedVideo] = useState(null);
//   const [inputType, setInputType]         = useState('photo');
//   const [mode, setMode]                   = useState('camera');
//   const [activeTab, setActiveTab]         = useState('photo');
//   const [facing, setFacing]               = useState('front');
//   const [isRecording, setIsRecording]     = useState(false);
//   const [isAnalyzing, setIsAnalyzing]     = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [results, setResults]             = useState(null);
//   const [videoResults, setVideoResults]   = useState(null);
//   const [showCrisisAlert, setShowCrisis]  = useState(false);
//   const [isOffline, setIsOffline]         = useState(false);
//   const [pendingCount, setPendingCount]   = useState(0);
//   const [isSyncing, setIsSyncing]         = useState(false);
//   const [savedItem, setSavedItem]         = useState(null);
//   const cameraRef = useRef(null);

//   const player = useVideoPlayer(capturedVideo || '', p => { if (capturedVideo) { p.loop = true; p.play(); } });

//   useEffect(() => {
//     if (!cameraPermission?.granted) requestCameraPermission();
//     if (!micPermission?.granted) requestMicPermission();
//     checkStatus();
//     const interval = setInterval(async () => {
//       const online = await checkOnline();
//       setIsOffline(!online);
//       if (online) syncQueue();
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const checkStatus = async () => {
//     const online = await checkOnline(); setIsOffline(!online);
//     const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
//     setPendingCount(ic + vc);
//     if (online && (ic + vc) > 0) syncQueue();
//   };

//   const syncQueue = async () => {
//     const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
//     if (!ic && !vc) return;
//     setIsSyncing(true);
//     try {
//       const done = await processQueue();
//       if (done > 0) Alert.alert('Synced', `${done} saved file(s) analysed.`);
//       const ic2 = await getQueueCount('image'); const vc2 = await getQueueCount('video');
//       setPendingCount(ic2 + vc2);
//     } finally { setIsSyncing(false); }
//   };

//   const resetAll = () => {
//     setCapturedImage(null); setCapturedVideo(null); setResults(null); setVideoResults(null);
//     setShowCrisis(false); setMode('camera'); setIsRecording(false); setSavedItem(null); setUploadProgress(0);
//   };

//   const takePicture = async () => {
//     if (!cameraRef.current) return;
//     try {
//       // quality 0.5 + smaller base = faster upload to Hugging Face
//       const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: false });
//       setCapturedImage(photo.uri); setCapturedVideo(null);
//       setInputType('photo'); setResults(null); setVideoResults(null);
//       setShowCrisis(false); setSavedItem(null); setMode('preview');
//     } catch { Alert.alert('Error', 'Could not take picture.'); }
//   };

//   const pickImageFromGallery = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') return;
//     // Resize to max 640px and compress — drastically reduces upload size
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ['images'], allowsEditing: true, quality: 0.5,
//       exif: false,
//     });
//     if (!res.canceled && res.assets[0]) {
//       setCapturedImage(res.assets[0].uri); setCapturedVideo(null);
//       setInputType('photo'); setResults(null); setVideoResults(null);
//       setShowCrisis(false); setSavedItem(null); setMode('preview');
//     }
//   };

//   const startRecording = async () => {
//     if (!cameraRef.current || isRecording) return;
//     if (!micPermission?.granted) {
//       Alert.alert('Microphone Permission', 'Recording requires microphone access.',
//         [{ text: 'Cancel', style: 'cancel' }, { text: 'Grant', onPress: requestMicPermission }]);
//       return;
//     }
//     try {
//       setIsRecording(true);
//       const video = await cameraRef.current.recordAsync({ maxDuration: 10, quality: '480p' });
//       if (video?.uri) {
//         setCapturedVideo(video.uri); setCapturedImage(null);
//         setInputType('video'); setResults(null); setVideoResults(null);
//         setShowCrisis(false); setSavedItem(null); setMode('preview');
//       } else {
//         Alert.alert('Recording Failed', 'No video was captured. Please try again or use Gallery.');
//       }
//     } catch (e) {
//       console.error('Recording error:', e);
//       Alert.alert('Recording Failed', 'Could not record video. Please ensure camera and microphone permissions are granted, then try again.');
//     } finally { setIsRecording(false); }
//   };

//   const stopRecording = () => { if (cameraRef.current && isRecording) cameraRef.current.stopRecording(); };

//   const pickVideoFromGallery = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') return;
//     const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: true, quality: 0.8 });
//     if (!res.canceled && res.assets[0]) {
//       setCapturedVideo(res.assets[0].uri); setCapturedImage(null);
//       setInputType('video'); setResults(null); setVideoResults(null);
//       setShowCrisis(false); setSavedItem(null); setMode('preview');
//     }
//   };

//   const analyzeMedia = async () => {
//     const online = await checkOnline(); setIsOffline(!online);
//     const uri = inputType === 'photo' ? capturedImage : capturedVideo;
//     if (!online) {
//       Alert.alert('No Internet', 'Choose what to do:', [
//         { text: 'Save for Later', onPress: async () => {
//           const type = inputType === 'photo' ? 'image' : 'video';
//           await addToQueue({ type, uri });
//           const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
//           setPendingCount(ic + vc); setSavedItem({ type: inputType, uri });
//           Alert.alert('Saved', 'Will be automatically analysed when you reconnect.');
//         }},
//         { text: 'Switch to Text', onPress: () => navigation.navigate('TextAnalysis') },
//         { text: 'Cancel', style: 'cancel' },
//       ]);
//       return;
//     }
//     if (inputType === 'photo') await analyzePhoto();
//     else await analyzeVideo();
//   };

//   // Wake up Hugging Face if it's cold — sends a lightweight ping first
//   const wakeUpBackend = async () => {
//     try {
//       await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
//     } catch { /* ignore — just warming up */ }
//   };

//   const analyzePhoto = async () => {
//     setIsAnalyzing(true);
//     try {
//       // Ping backend first so cold start happens before we upload the image
//       await wakeUpBackend();

//       const formData = new FormData();
//       formData.append('image_file', { uri: capturedImage, type: 'image/jpeg', name: 'photo.jpg' });

//       // Try /analyze-image first (faster), fall back to /analyze-video
//       let response;
//       try {
//         response = await axios.post(
//           `${API_BASE_URL}/analyze-image`,
//           formData,
//           { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 },
//         );
//       } catch (e1) {
//         if (e1.response?.status === 404 || e1.code === 'ECONNABORTED') {
//           // Endpoint doesn't exist or timed out — try the video endpoint
//           response = await axios.post(
//             `${API_BASE_URL}/analyze-video`,
//             formData,
//             { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 },
//           );
//         } else {
//           throw e1;
//         }
//       }

//       console.log('PHOTO RESPONSE STATUS:', response.data.status);
//       console.log('PHOTO DATA:', JSON.stringify(response.data.data?.emotion).slice(0, 200));

//       if (response.data.status === 'no_face') {
//         Alert.alert('No Face Detected', 'No human face was found. Please take a clear photo of your face with good lighting.');
//         return;
//       }

//       const data = response.data.data;

//       // faces_detected field check
//       if (data?.faces_detected === 0 || data?.face_count === 0) {
//         Alert.alert('No Face Detected', 'No human face was found. Please take a photo with your face clearly visible.');
//         return;
//       }

//       // If neutral takes >65% probability AND no explicit face fields — very likely no real face
//       const probs = data?.emotion?.all_probabilities || {};
//       const neutralProb = probs['neutral'] || 0;
//       const hasExplicitFace = data?.faces_detected > 0 || data?.face_count > 0;
//       if (!hasExplicitFace && Object.keys(probs).length > 0 && neutralProb > 0.65) {
//         Alert.alert('No Face Detected', 'No human face detected. Please take a clear photo of your face with good lighting.');
//         return;
//       }

//       setResults(data);
//       await saveMoodEntry(data, { inputImageUri: capturedImage });
//       if (data.wellness_score <= 3.0) setShowCrisis(true);

//     } catch (e) {
//       console.error('analyzePhoto error:', e.code, e.message);
//       const isTimeout = e.code === 'ECONNABORTED' || e.message?.includes('timeout');
//       const isOfflineErr = e.message?.includes('Network') || e.message?.includes('network');

//       if (isTimeout) {
//         Alert.alert(
//           'Server is Warming Up',
//           'The AI server takes up to 60 seconds to start. Please try again — it will be faster now.',
//           [{ text: 'Try Again', onPress: () => analyzePhoto() }, { text: 'Dismiss', style: 'cancel' }],
//         );
//       } else if (isOfflineErr) {
//         Alert.alert('No Connection', 'Please check your internet and try again.', [
//           { text: 'Save for Later', onPress: async () => {
//             await addToQueue({ type: 'image', uri: capturedImage });
//             const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
//             setPendingCount(ic + vc); setSavedItem({ type: 'photo', uri: capturedImage });
//           }},
//           { text: 'Dismiss', style: 'cancel' },
//         ]);
//       } else {
//         Alert.alert(
//           'Analysis Failed',
//           e.response?.data?.detail || 'Something went wrong. Please try again.',
//           [{ text: 'Try Again', onPress: () => analyzePhoto() }, { text: 'Dismiss', style: 'cancel' }],
//         );
//       }
//     } finally { setIsAnalyzing(false); }
//   };

//   const analyzeVideo = async () => {
//     Alert.alert('Upload Video?', 'This takes 30–60 seconds.', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Upload & Analyse', onPress: async () => {
//         setIsAnalyzing(true); setUploadProgress(0);
//         try {
//           const formData = new FormData();
//           formData.append('video_file', { uri: capturedVideo, type: 'video/mp4', name: 'video.mp4' });
//           const response = await axios.post(`${API_BASE_URL}/analyze-video-upload`, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000,
//             onUploadProgress: e => setUploadProgress(Math.min((e.loaded / e.total) * 100, 100)),
//           });
//           if (response.data.status === 'no_face') { Alert.alert('No Faces Detected', 'No human face was detected in this video. Please record a video with your face clearly visible.'); return; }
//           const vdata = response.data.data;
//           // Log actual structure to help debug field names
//           console.log('VIDEO RESULT KEYS:', JSON.stringify(Object.keys(vdata)));
//           console.log('VIDEO EMOTION KEYS:', JSON.stringify(Object.keys(vdata.emotion || {})));
//           // Reject very low confidence — no real face detected
//           if (vdata?.emotion?.confidence !== undefined && vdata.emotion.confidence < 0.45) {
//             Alert.alert('No Face Detected', 'Could not detect a human face clearly in the video. Please record again with your face well lit and centred.');
//             return;
//           }
//           setVideoResults(vdata);
//           await saveMoodEntry(response.data.data, { hasVideo: true });
//           if (response.data.data.wellness_score <= 3.0) setShowCrisis(true);
//         } catch (e) {
//           Alert.alert('Error', e.response?.data?.detail || 'Analysis failed.', [
//             { text: 'Save for Later', onPress: async () => {
//               await addToQueue({ type: 'video', uri: capturedVideo });
//               const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
//               setPendingCount(ic + vc); setSavedItem({ type: 'video', uri: capturedVideo });
//             }},
//             { text: 'Dismiss', style: 'cancel' },
//           ]);
//         } finally { setIsAnalyzing(false); setUploadProgress(0); }
//       }},
//     ]);
//   };

//   const retryNow = async () => {
//     if (!savedItem) return;
//     const online = await checkOnline();
//     if (!online) { Alert.alert('Still Offline', 'No internet yet.'); return; }
//     setSavedItem(null); setIsOffline(false);
//     if (savedItem.type === 'photo') await analyzePhoto();
//     else await analyzeVideo();
//   };

//   // ── Permissions screen ────────────────────────────────────────────────────
//   if (!cameraPermission?.granted || !micPermission?.granted) {
//     return (
//       <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
//         <StatusBar barStyle="dark-content" />
//         <Icon name="camera-off" size={64} color={C.primary} />
//         <Text style={{ fontSize: 20, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 10 }}>Permissions Needed</Text>
//         <Text style={{ fontSize: 14, color: C.textMid, textAlign: 'center', marginBottom: 28, lineHeight: 21 }}>
//           Camera and microphone access are required for facial analysis.
//         </Text>
//         <TouchableOpacity style={s.bigBtn} onPress={() => { requestCameraPermission(); requestMicPermission(); }} activeOpacity={0.85}>
//           <Text style={s.bigBtnTxt}>Grant Permissions</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ── Results helper ────────────────────────────────────────────────────────
//   const ResultsScreen = ({ data, title, sub, onReset, extra }) => {
//     const wc = getWellnessColor(data.wellness_score);
//     return (
//       <View style={s.root}>
//         <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <View style={s.header}>
//             <View style={s.decor} />
//             <TouchableOpacity style={s.backBtn} onPress={onReset}>
//               <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
//             </TouchableOpacity>
//             <Text style={s.headerTitle}>{title}</Text>
//             <Text style={s.headerSub}>{sub}</Text>
//           </View>
//           {capturedImage && inputType === 'photo' && (
//             <Image source={{ uri: capturedImage }} style={s.resultImg} resizeMode="cover" />
//           )}
//           <View style={s.body}>
//             <View style={[s.resultHero, { borderTopColor: wc }]}>
//               <Icon name={getEmotionIcon(data.emotion.primary)} size={56} color={wc} />
//               <Text style={s.resultEmo}>{data.emotion.primary?.charAt(0).toUpperCase() + data.emotion.primary?.slice(1)}</Text>
//               <Text style={s.resultConf}>{(data.emotion.confidence * 100).toFixed(1)}% confidence</Text>
//             </View>
//             <View style={s.card}>
//               <Text style={s.cardLbl}>Wellness Score</Text>
//               <View style={s.wRow}>
//                 <Text style={[s.wBig, { color: wc }]}>{data.wellness_score.toFixed(1)}</Text>
//                 <Text style={s.wOf}>/10</Text>
//                 <View style={[s.wTag, { borderColor: wc }]}><Text style={[s.wTagTxt, { color: wc }]}>{getWellnessLabel(data.wellness_score)}</Text></View>
//               </View>
//               <View style={s.bar}><View style={[s.barFill, { width: `${(data.wellness_score / 10) * 100}%`, backgroundColor: wc }]} /></View>
//               <Text style={s.interp}>{data.interpretation}</Text>
//             </View>
//             {extra}
//             <View style={s.card}>
//               <Text style={s.cardLbl}>All Detected Emotions</Text>
//               {Object.entries(data.emotion.all_probabilities || {}).sort((a,b)=>b[1]-a[1]).map(([emo, prob]) => (
//                 <View key={emo} style={s.probRow}>
//                   <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
//                   <Text style={s.probLbl}>  {emo.charAt(0).toUpperCase()+emo.slice(1)}</Text>
//                   <View style={s.probWrap}><View style={[s.probFill, { width: `${prob*100}%`, backgroundColor: C.primary }]} /></View>
//                   <Text style={[s.probPct, { color: C.primary }]}>{(prob*100).toFixed(0)}%</Text>
//                 </View>
//               ))}
//             </View>
//             <TouchableOpacity style={s.bigBtn} onPress={onReset} activeOpacity={0.85}>
//               <Icon name="camera-retake" size={18} color="#fff" />
//               <Text style={s.bigBtnTxt}> Analyse Another</Text>
//             </TouchableOpacity>
//             <View style={{ height: 32 }} />
//           </View>
//         </ScrollView>
//         <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//       </View>
//     );
//   };

//   if (results && inputType === 'photo') {
//     return <ResultsScreen data={results} title="Photo Results" sub="Facial expression analysis" onReset={resetAll} />;
//   }

//   if (videoResults && inputType === 'video') {
//     // Handle multiple possible field names from backend
//     const timeline = videoResults.frame_timeline
//       || videoResults.frames
//       || videoResults.emotion_timeline
//       || videoResults.frame_emotions
//       || [];

//     const allProbs = videoResults.emotion?.all_probabilities
//       || videoResults.all_emotions
//       || videoResults.emotion_probabilities
//       || {};

//     const frameCount = videoResults.frames_analyzed
//       || videoResults.frame_count
//       || videoResults.total_frames
//       || timeline.length
//       || 0;

//     console.log('TIMELINE:', JSON.stringify(timeline));
//     console.log('ALL_PROBS:', JSON.stringify(allProbs));

//     const extra = (
//       <>
//         {timeline.length > 0 && (
//           <View style={s.card}>
//             <Text style={s.cardLbl}>Emotion Timeline</Text>
//             {timeline.map((frame, idx) => (
//               <View key={idx} style={s.frameRow}>
//                 <View style={[s.frameDot, { backgroundColor: C.primary }]} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={s.frameTime}>{frame.time ?? frame.timestamp ?? `${idx}s`}</Text>
//                   <Text style={s.frameEmo}>
//                     {(frame.emotion ?? frame.dominant_emotion ?? '').charAt(0).toUpperCase()
//                       + (frame.emotion ?? frame.dominant_emotion ?? '').slice(1)}
//                   </Text>
//                 </View>
//                 <Text style={[s.probPct, { color: C.primary }]}>
//                   {((frame.confidence ?? frame.score ?? 0) * 100).toFixed(0)}%
//                 </Text>
//               </View>
//             ))}
//           </View>
//         )}
//         {Object.keys(allProbs).length > 0 && (
//           <View style={s.card}>
//             <Text style={s.cardLbl}>All Detected Emotions</Text>
//             {Object.entries(allProbs).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
//               <View key={emo} style={s.probRow}>
//                 <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
//                 <Text style={s.probLbl}>  {emo.charAt(0).toUpperCase() + emo.slice(1)}</Text>
//                 <View style={s.probWrap}>
//                   <View style={[s.probFill, { width: `${prob * 100}%`, backgroundColor: C.primary }]} />
//                 </View>
//                 <Text style={[s.probPct, { color: C.primary }]}>{(prob * 100).toFixed(0)}%</Text>
//               </View>
//             ))}
//           </View>
//         )}
//       </>
//     );
//     return <ResultsScreen data={videoResults} title="Video Results" sub={`${frameCount} frames analysed`} onReset={resetAll} extra={extra} />;
//   }

//   // ── Camera / Preview ──────────────────────────────────────────────────────
//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

//       <View style={s.header}>
//         <View style={s.decor} />
//         <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
//         </TouchableOpacity>
//         <Text style={s.headerTitle}>Facial Analysis</Text>
//         <Text style={s.headerSub}>Photo or short video</Text>
//       </View>

//       {isOffline && (
//         <View style={s.offlineBanner}>
//           <Icon name="wifi-off" size={16} color="#fff" />
//           <Text style={s.bannerTxt}> Offline — files saved, auto-analysed on reconnect</Text>
//         </View>
//       )}
//       {pendingCount > 0 && !isOffline && (
//         <TouchableOpacity style={s.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
//           <View style={s.syncRow}>
//             {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="cloud-sync" size={16} color="#fff" />}
//             <Text style={s.syncTxt}>  {isSyncing ? `Analysing ${pendingCount} saved file(s)…` : `${pendingCount} saved file(s) — Tap to analyse`}</Text>
//           </View>
//         </TouchableOpacity>
//       )}

//       <View style={s.tabBar}>
//         {['photo', 'video'].map(tab => (
//           <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
//             onPress={() => { setActiveTab(tab); setInputType(tab); resetAll(); }} activeOpacity={0.85}>
//             <Icon name={tab === 'photo' ? 'camera' : 'video'} size={16} color={activeTab === tab ? C.primary : C.textLight} />
//             <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}> {tab === 'photo' ? 'Photo' : 'Video'}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {mode === 'preview' && (
//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
//           {capturedImage && <Image source={{ uri: capturedImage }} style={s.previewImg} resizeMode="cover" />}
//           {capturedVideo && <VideoView player={player} style={s.previewImg} contentFit="cover" />}

//           {savedItem && (
//             <View style={s.savedCard}>
//               <View style={s.savedTitle}>
//                 <Icon name="content-save" size={16} color={C.accentOrange} />
//                 <Text style={s.savedTitleTxt}> Saved Locally</Text>
//               </View>
//               <Text style={s.savedDesc}>Reconnect to analyse, or use Text Analysis.</Text>
//               <View style={s.savedRow}>
//                 <TouchableOpacity style={s.retryBtn} onPress={retryNow} activeOpacity={0.85}>
//                   <Icon name="refresh" size={14} color="#fff" /><Text style={s.retryTxt}> Retry</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={s.textSwitchBtn} onPress={() => navigation.navigate('TextAnalysis')} activeOpacity={0.85}>
//                   <Icon name="text-box-edit-outline" size={14} color={C.primary} /><Text style={s.textSwitchTxt}> Use Text</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {isAnalyzing && (
//             <View style={s.loadCard}>
//               <ActivityIndicator size="large" color={C.primary} />
//               <Text style={s.loadTxt}>Analysing{inputType === 'video' ? ' video' : ' photo'}…</Text>
//               {inputType === 'video' && uploadProgress > 0 && (
//                 <View style={[s.bar, { width: '80%', marginTop: 10 }]}>
//                   <View style={[s.barFill, { width: `${uploadProgress}%`, backgroundColor: C.primary }]} />
//                 </View>
//               )}
//               <Text style={s.loadSub}>
//                 {inputType === 'video'
//                   ? 'Uploading and analysing · 30–60 seconds'
//                   : 'Connecting to AI server · up to 60 seconds\nFirst analysis may take longer'}
//               </Text>
//             </View>
//           )}

//           {!isAnalyzing && !savedItem && (
//             <View style={s.previewActions}>
//               <TouchableOpacity style={s.bigBtn} onPress={analyzeMedia} activeOpacity={0.85}>
//                 <Icon name="magnify" size={18} color="#fff" /><Text style={s.bigBtnTxt}> Analyse</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={s.retakeBtn} onPress={resetAll} activeOpacity={0.85}>
//                 <Icon name="camera-retake" size={18} color={C.primary} /><Text style={s.retakeTxt}> Retake</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </ScrollView>
//       )}

//       {mode === 'camera' && (
//         <>
//           <View style={s.cameraWrap}>
//             <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} mode={activeTab === 'video' ? 'video' : 'picture'} />
//             {/* Overlay outside CameraView — avoids children warning */}
//             <View style={s.overlay} pointerEvents="none">
//               <View style={s.faceGuide} />
//               <Text style={s.guideLabel}>Align face here</Text>
//             </View>
//             {isRecording && (
//               <View style={s.recBadge}>
//                 <View style={s.recDot} />
//                 <Text style={s.recTxt}>REC</Text>
//               </View>
//             )}
//           </View>

//           <View style={s.controls}>
//             <TouchableOpacity style={s.sideBtn}
//               onPress={activeTab === 'photo' ? pickImageFromGallery : pickVideoFromGallery} activeOpacity={0.85}>
//               <Icon name="image-multiple" size={26} color={C.textMid} />
//               <Text style={s.sideLbl}>Gallery</Text>
//             </TouchableOpacity>

//             {activeTab === 'photo' ? (
//               <TouchableOpacity style={s.captureBtn} onPress={takePicture} activeOpacity={0.75}>
//                 <View style={s.captureRing}>
//                   <View style={s.captureFill} />
//                 </View>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity style={s.captureBtn} onPress={isRecording ? stopRecording : startRecording} activeOpacity={0.75}>
//                 <View style={s.captureRing}>
//                   {isRecording
//                     ? <View style={s.captureStop} />
//                     : <View style={s.captureFill} />
//                   }
//                 </View>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity style={s.sideBtn} onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')} activeOpacity={0.85}>
//               <Icon name="camera-flip" size={26} color={C.textMid} />
//               <Text style={s.sideLbl}>Flip</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={s.tipsInline}>
//             <Icon name="lightbulb-outline" size={13} color={C.textMid} />
//             <Text style={s.tipsTxt}>
//               {'  '}{activeTab === 'photo' ? 'Good lighting improves accuracy · Fast 2–3 second analysis' : 'Max 10 seconds · Good lighting · Face camera directly'}
//             </Text>
//           </View>
//         </>
//       )}

//       <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   root:           { flex: 1, backgroundColor: C.bg },
//   header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden' },
//   decor:          { position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)' },
//   backBtn:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   backTxt:        { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
//   headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
//   headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
//   offlineBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentOrange, padding: 11, paddingHorizontal: 16 },
//   bannerTxt:      { color: '#fff', fontSize: 12, fontWeight: '600' },
//   syncBanner:     { backgroundColor: C.primaryDark, padding: 11, paddingHorizontal: 16 },
//   syncRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   syncTxt:        { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
//   tabBar:         { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
//   tab:            { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 3, borderBottomColor: 'transparent' },
//   tabActive:      { borderBottomColor: C.primary },
//   tabTxt:         { fontSize: 14, color: C.textLight, fontWeight: '600' },
//   tabTxtActive:   { color: C.primary },
//   cameraWrap:     { flex: 1, margin: 14, borderRadius: 20, overflow: 'hidden' },
//   overlay:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   faceGuide:      { width: 180, height: 220, borderRadius: 90, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.8)', borderStyle: 'dashed' },
//   guideLabel:     { color: '#fff', marginTop: 14, fontSize: 13, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
//   recBadge:       { position: 'absolute', top: 14, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
//   recDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accentRed, marginRight: 6 },
//   recTxt:         { color: '#fff', fontWeight: '700', fontSize: 13 },
//   controls:       { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
//   sideBtn:        { alignItems: 'center', padding: 8 },
//   sideLbl:        { fontSize: 10, color: C.textMid, marginTop: 3, fontWeight: '600' },
//   captureBtn:     { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
//   captureRing:    { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
//   captureFill:    { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.85)' },
//   captureStop:    { width: 24, height: 24, borderRadius: 5, backgroundColor: C.accentRed },
//   tipsInline:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingVertical: 10 },
//   tipsTxt:        { fontSize: 12, color: C.textMid, lineHeight: 18, flex: 1 },
//   previewImg:     { width: '92%', height: 240, alignSelf: 'center', borderRadius: 18, marginTop: 14 },
//   previewActions: { padding: 16, gap: 10 },
//   savedCard:      { margin: 16, backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.accentOrange },
//   savedTitle:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
//   savedTitleTxt:  { fontSize: 14, fontWeight: '700', color: C.text },
//   savedDesc:      { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 14 },
//   savedRow:       { flexDirection: 'row', gap: 10 },
//   retryBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, padding: 12, borderRadius: 12 },
//   retryTxt:       { color: '#fff', fontSize: 13, fontWeight: '700' },
//   textSwitchBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight, padding: 12, borderRadius: 12 },
//   textSwitchTxt:  { color: C.primary, fontSize: 13, fontWeight: '700' },
//   loadCard:       { alignItems: 'center', padding: 28, margin: 16 },
//   loadTxt:        { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
//   loadSub:        { marginTop: 4, fontSize: 12, color: C.textLight },
//   body:           { padding: 16 },
//   resultImg:      { width: '92%', height: 200, alignSelf: 'center', borderRadius: 18, marginTop: 14 },
//   resultHero:     { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, gap: 6 },
//   resultEmo:      { fontSize: 26, fontWeight: '700', color: C.text },
//   resultConf:     { fontSize: 13, color: C.textMid },
//   card:           { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2 },
//   cardLbl:        { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 12 },
//   wRow:           { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, gap: 8 },
//   wBig:           { fontSize: 40, fontWeight: '700' },
//   wOf:            { fontSize: 20, color: C.textLight },
//   wTag:           { marginLeft: 'auto', backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
//   wTagTxt:        { fontSize: 12, fontWeight: '600' },
//   bar:            { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
//   barFill:        { height: '100%', borderRadius: 4 },
//   interp:         { fontSize: 14, color: C.textMid, lineHeight: 22, marginTop: 10 },
//   probRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   probLbl:        { fontSize: 12, color: C.text, width: 110 },
//   probWrap:       { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
//   probFill:       { height: '100%', borderRadius: 4 },
//   probPct:        { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
//   frameRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
//   frameDot:       { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
//   frameTime:      { fontSize: 11, color: C.textLight, fontWeight: '600' },
//   frameEmo:       { fontSize: 13, color: C.text, fontWeight: '600' },
//   bigBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 15, elevation: 2 },
//   bigBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '700' },
//   retakeBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight, borderRadius: 14, padding: 15 },
//   retakeTxt:      { color: C.primary, fontSize: 15, fontWeight: '700' },
// });

// src/screens/VideoAnalysisScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image, StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import axios from 'axios';
import { saveMoodEntry } from '../utils/moodStorage';
import { addToQueue, getQueueCount, processQueue } from '../utils/offlineQueue';
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

export default function VideoAnalysisScreen({ navigation }) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission]       = useMicrophonePermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [inputType, setInputType]         = useState('photo');
  const [mode, setMode]                   = useState('camera');
  const [activeTab, setActiveTab]         = useState('photo');
  const [facing, setFacing]               = useState('front');
  const [isRecording, setIsRecording]     = useState(false);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [loadingMsg, setLoadingMsg]       = useState('Analysing...');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults]             = useState(null);
  const [videoResults, setVideoResults]   = useState(null);
  const [showCrisisAlert, setShowCrisis]  = useState(false);
  const [isOffline, setIsOffline]         = useState(false);
  const [pendingCount, setPendingCount]   = useState(0);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [savedItem, setSavedItem]         = useState(null);
  const cameraRef = useRef(null);

  const player = useVideoPlayer(capturedVideo || '', p => { if (capturedVideo) { p.loop = true; p.play(); } });

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!micPermission?.granted) requestMicPermission();
    checkStatus();
    const interval = setInterval(async () => {
      const online = await checkOnline();
      setIsOffline(!online);
      if (online) syncQueue();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const online = await checkOnline(); setIsOffline(!online);
    const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
    setPendingCount(ic + vc);
    if (online && (ic + vc) > 0) syncQueue();
  };

  const syncQueue = async () => {
    const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
    if (!ic && !vc) return;
    setIsSyncing(true);
    try {
      const done = await processQueue();
      if (done > 0) Alert.alert('Synced', `${done} saved file(s) analysed.`);
      const ic2 = await getQueueCount('image'); const vc2 = await getQueueCount('video');
      setPendingCount(ic2 + vc2);
    } finally { setIsSyncing(false); }
  };

  const resetAll = () => {
    setCapturedImage(null); setCapturedVideo(null); setResults(null); setVideoResults(null);
    setShowCrisis(false); setMode('camera'); setIsRecording(false); setSavedItem(null); setUploadProgress(0);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      // skipProcessing:false — Android applies EXIF orientation so
      // the backend receives a correctly-oriented image regardless of
      // which camera (front/back) was used.
      // width:640 downscales at capture to match gallery output size.
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
        width: 640,
      });
      setCapturedImage(photo.uri); setCapturedVideo(null);
      setInputType('photo'); setResults(null); setVideoResults(null);
      setShowCrisis(false); setSavedItem(null); setMode('preview');
    } catch (err) {
      console.error('takePicture error:', err);
      Alert.alert('Error', 'Could not take picture. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    // Resize to max 640px and compress — drastically reduces upload size
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.5,
      exif: false,
    });
    if (!res.canceled && res.assets[0]) {
      setCapturedImage(res.assets[0].uri); setCapturedVideo(null);
      setInputType('photo'); setResults(null); setVideoResults(null);
      setShowCrisis(false); setSavedItem(null); setMode('preview');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    if (!micPermission?.granted) {
      Alert.alert('Microphone Permission', 'Recording requires microphone access.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Grant', onPress: requestMicPermission }]);
      return;
    }
    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 10, quality: '480p' });
      if (video?.uri) {
        setCapturedVideo(video.uri); setCapturedImage(null);
        setInputType('video'); setResults(null); setVideoResults(null);
        setShowCrisis(false); setSavedItem(null); setMode('preview');
      } else {
        Alert.alert('Recording Failed', 'No video was captured. Please try again or use Gallery.');
      }
    } catch (e) {
      console.error('Recording error:', e);
      Alert.alert('Recording Failed', 'Could not record video. Please ensure camera and microphone permissions are granted, then try again.');
    } finally { setIsRecording(false); }
  };

  const stopRecording = () => { if (cameraRef.current && isRecording) cameraRef.current.stopRecording(); };

  const pickVideoFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: true, quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      setCapturedVideo(res.assets[0].uri); setCapturedImage(null);
      setInputType('video'); setResults(null); setVideoResults(null);
      setShowCrisis(false); setSavedItem(null); setMode('preview');
    }
  };

  const analyzeMedia = async () => {
    const online = await checkOnline(); setIsOffline(!online);
    const uri = inputType === 'photo' ? capturedImage : capturedVideo;
    if (!online) {
      Alert.alert('No Internet', 'Choose what to do:', [
        { text: 'Save for Later', onPress: async () => {
          const type = inputType === 'photo' ? 'image' : 'video';
          await addToQueue({ type, uri });
          const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
          setPendingCount(ic + vc); setSavedItem({ type: inputType, uri });
          Alert.alert('Saved', 'Will be automatically analysed when you reconnect.');
        }},
        { text: 'Switch to Text', onPress: () => navigation.navigate('TextAnalysis') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (inputType === 'photo') await analyzePhoto();
    else await analyzeVideo();
  };

  // Wake up Hugging Face if it's cold — sends a lightweight ping first
  const wakeUpBackend = async () => {
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
    } catch { /* ignore — just warming up */ }
  };

  const analyzePhoto = async () => {
    setIsAnalyzing(true);
    setLoadingMsg('Connecting to server...');
    try {
      await wakeUpBackend();
      setLoadingMsg('Detecting face...');

      const formData = new FormData();
      formData.append('image_file', { uri: capturedImage, type: 'image/jpeg', name: 'photo.jpg' });

      setLoadingMsg('Analysing expression...');
      const response = await axios.post(
        `${API_BASE_URL}/analyze-video`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000 },
      );

      console.log('PHOTO STATUS:', response.data.status);
      console.log('PHOTO EMOTION:', JSON.stringify(response.data.data?.emotion).slice(0, 200));

      if (response.data.status === 'no_face') {
        Alert.alert('No Face Detected', 'No human face was found. Please take a clear photo of your face with good lighting.');
        return;
      }

      const data = response.data.data;
      if (!data) { Alert.alert('Error', 'Invalid response. Please try again.'); return; }

      // Explicit face count field from backend
      if (data?.faces_detected === 0 || data?.face_count === 0) {
        Alert.alert('No Face Detected', 'No human face found. Please take a photo with your face clearly visible.');
        return;
      }

      const probs = data?.emotion?.all_probabilities || {};

      // ── No-face detection logic ────────────────────────────────────────
      // Real faces produce a spread of emotions — at least one non-neutral
      // emotion above a meaningful threshold.
      // Non-face images get high neutral (70–90%) with no real competition.
      // Two checks:
      //   1. Neutral > 70% AND confidence < 0.75 — uncertain high neutral = likely no face
      //   2. Neutral > 60% AND no other emotion exceeds 8% — flat distribution = no face
      const confidence  = data?.emotion?.confidence || 0;
      const neutralProb = probs['neutral'] || 0;
      const maxOther    = Math.max(
        0,
        ...Object.entries(probs)
          .filter(([k]) => k !== 'neutral')
          .map(([, v]) => v)
      );

      // ── Tightened thresholds based on observed failures ──────────────
      // Room photo: 83.5% neutral, 6% sad, 3% fear → caught by rule 1
      // Real neutral face: typically confidence > 0.70, multiple emotions compete
      // Rule 1: High neutral + overall confidence below 0.70 = likely no real face
      // Rule 2: Neutral > 0.65 and no other emotion above 8% = flat non-face response
      // Rule 3: Confidence below 0.50 regardless of emotion = model is guessing
      const likelyNoFace =
        (neutralProb > 0.65 && confidence < 0.70) ||   // high neutral, uncertain
        (neutralProb > 0.60 && maxOther < 0.08)  ||    // flat distribution
        (confidence < 0.50);                            // model has no confidence at all

      if (Object.keys(probs).length > 0 && likelyNoFace) {
        Alert.alert(
          'No Face Detected',
          'No human face was detected in this image. Please take a clear well-lit selfie with your face centred in the frame.',
        );
        return;
      }

      setResults(data);
      await saveMoodEntry(data, { inputImageUri: capturedImage });
      if (data.wellness_score <= 3.0) setShowCrisis(true);

    } catch (e) {
      console.error('analyzePhoto error:', e.code, e.message);
      const isTimeout = e.code === 'ECONNABORTED' || e.message?.includes('timeout');
      const isNetwork = e.message?.includes('Network') || e.message?.includes('network');

      if (isTimeout) {
        Alert.alert(
          'Server Starting Up',
          'The AI server was asleep and needs time to wake up. Tap "Try Again" — it will be instant now.',
          [{ text: 'Try Again', onPress: () => analyzePhoto() }, { text: 'Dismiss', style: 'cancel' }],
        );
      } else if (isNetwork) {
        Alert.alert('No Connection', 'Please check your internet and try again.', [
          { text: 'Save for Later', onPress: async () => {
            await addToQueue({ type: 'image', uri: capturedImage });
            const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
            setPendingCount(ic + vc); setSavedItem({ type: 'photo', uri: capturedImage });
          }},
          { text: 'Dismiss', style: 'cancel' },
        ]);
      } else {
        Alert.alert(
          'Server Overloaded',
          'The AI server is busy. Please wait a few seconds and try again.',
          [{ text: 'Try Again', onPress: () => analyzePhoto() }, { text: 'Dismiss', style: 'cancel' }],
        );
      }
    } finally { setIsAnalyzing(false); setLoadingMsg('Analysing...'); }
  };

  const analyzeVideo = async () => {
    Alert.alert('Upload Video?', 'This takes 30–60 seconds.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Upload & Analyse', onPress: async () => {
        setIsAnalyzing(true); setUploadProgress(0);
        try {
          const formData = new FormData();
          formData.append('video_file', { uri: capturedVideo, type: 'video/mp4', name: 'video.mp4' });
          const response = await axios.post(`${API_BASE_URL}/analyze-video-upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000,
            onUploadProgress: e => setUploadProgress(Math.min((e.loaded / e.total) * 100, 100)),
          });
          if (response.data.status === 'no_face') { Alert.alert('No Faces Detected', 'No human face was detected in this video. Please record a video with your face clearly visible.'); return; }
          const vdata = response.data.data;
          // Log actual structure to help debug field names
          console.log('VIDEO RESULT KEYS:', JSON.stringify(Object.keys(vdata)));
          console.log('VIDEO EMOTION KEYS:', JSON.stringify(Object.keys(vdata.emotion || {})));
          // Reject very low confidence — no real face detected
          if (vdata?.emotion?.confidence !== undefined && vdata.emotion.confidence < 0.45) {
            Alert.alert('No Face Detected', 'Could not detect a human face clearly in the video. Please record again with your face well lit and centred.');
            return;
          }
          setVideoResults(vdata);
          await saveMoodEntry(response.data.data, { hasVideo: true });
          if (response.data.data.wellness_score <= 3.0) setShowCrisis(true);
        } catch (e) {
          Alert.alert('Error', e.response?.data?.detail || 'Analysis failed.', [
            { text: 'Save for Later', onPress: async () => {
              await addToQueue({ type: 'video', uri: capturedVideo });
              const ic = await getQueueCount('image'); const vc = await getQueueCount('video');
              setPendingCount(ic + vc); setSavedItem({ type: 'video', uri: capturedVideo });
            }},
            { text: 'Dismiss', style: 'cancel' },
          ]);
        } finally { setIsAnalyzing(false); setUploadProgress(0); }
      }},
    ]);
  };

  const retryNow = async () => {
    if (!savedItem) return;
    const online = await checkOnline();
    if (!online) { Alert.alert('Still Offline', 'No internet yet.'); return; }
    setSavedItem(null); setIsOffline(false);
    if (savedItem.type === 'photo') await analyzePhoto();
    else await analyzeVideo();
  };

  // ── Permissions screen ────────────────────────────────────────────────────
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <StatusBar barStyle="dark-content" />
        <Icon name="camera-off" size={64} color={C.primary} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 10 }}>Permissions Needed</Text>
        <Text style={{ fontSize: 14, color: C.textMid, textAlign: 'center', marginBottom: 28, lineHeight: 21 }}>
          Camera and microphone access are required for facial analysis.
        </Text>
        <TouchableOpacity style={s.bigBtn} onPress={() => { requestCameraPermission(); requestMicPermission(); }} activeOpacity={0.85}>
          <Text style={s.bigBtnTxt}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Results helper ────────────────────────────────────────────────────────
  const ResultsScreen = ({ data, title, sub, onReset, extra }) => {
    const wc = getWellnessColor(data.wellness_score);
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View style={s.decor} />
            <TouchableOpacity style={s.backBtn} onPress={onReset}>
              <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>{title}</Text>
            <Text style={s.headerSub}>{sub}</Text>
          </View>
          {capturedImage && inputType === 'photo' && (
            <Image source={{ uri: capturedImage }} style={s.resultImg} resizeMode="cover" />
          )}
          <View style={s.body}>
            <View style={[s.resultHero, { borderTopColor: wc }]}>
              <Icon name={getEmotionIcon(data.emotion.primary)} size={56} color={wc} />
              <Text style={s.resultEmo}>{data.emotion.primary?.charAt(0).toUpperCase() + data.emotion.primary?.slice(1)}</Text>
              <Text style={s.resultConf}>{(data.emotion.confidence * 100).toFixed(1)}% confidence</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLbl}>Wellness Score</Text>
              <View style={s.wRow}>
                <Text style={[s.wBig, { color: wc }]}>{data.wellness_score.toFixed(1)}</Text>
                <Text style={s.wOf}>/10</Text>
                <View style={[s.wTag, { borderColor: wc }]}><Text style={[s.wTagTxt, { color: wc }]}>{getWellnessLabel(data.wellness_score)}</Text></View>
              </View>
              <View style={s.bar}><View style={[s.barFill, { width: `${(data.wellness_score / 10) * 100}%`, backgroundColor: wc }]} /></View>
              <Text style={s.interp}>{data.interpretation}</Text>
            </View>
            {extra}
            <View style={s.card}>
              <Text style={s.cardLbl}>All Detected Emotions</Text>
              {Object.entries(data.emotion.all_probabilities || {}).sort((a,b)=>b[1]-a[1]).map(([emo, prob]) => (
                <View key={emo} style={s.probRow}>
                  <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
                  <Text style={s.probLbl}>  {emo.charAt(0).toUpperCase()+emo.slice(1)}</Text>
                  <View style={s.probWrap}><View style={[s.probFill, { width: `${prob*100}%`, backgroundColor: C.primary }]} /></View>
                  <Text style={[s.probPct, { color: C.primary }]}>{(prob*100).toFixed(0)}%</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={s.bigBtn} onPress={onReset} activeOpacity={0.85}>
              <Icon name="camera-retake" size={18} color="#fff" />
              <Text style={s.bigBtnTxt}> Analyse Another</Text>
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
        <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
      </View>
    );
  };

  if (results && inputType === 'photo') {
    return <ResultsScreen data={results} title="Photo Results" sub="Facial expression analysis" onReset={resetAll} />;
  }

  if (videoResults && inputType === 'video') {
    // Handle multiple possible field names from backend
    const timeline = videoResults.frame_timeline
      || videoResults.frames
      || videoResults.emotion_timeline
      || videoResults.frame_emotions
      || [];

    const allProbs = videoResults.emotion?.all_probabilities
      || videoResults.all_emotions
      || videoResults.emotion_probabilities
      || {};

    const frameCount = videoResults.frames_analyzed
      || videoResults.frame_count
      || videoResults.total_frames
      || timeline.length
      || 0;

    console.log('TIMELINE:', JSON.stringify(timeline));
    console.log('ALL_PROBS:', JSON.stringify(allProbs));

    const extra = (
      <>
        {timeline.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardLbl}>Emotion Timeline</Text>
            {timeline.map((frame, idx) => (
              <View key={idx} style={s.frameRow}>
                <View style={[s.frameDot, { backgroundColor: C.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.frameTime}>{frame.time ?? frame.timestamp ?? `${idx}s`}</Text>
                  <Text style={s.frameEmo}>
                    {(frame.emotion ?? frame.dominant_emotion ?? '').charAt(0).toUpperCase()
                      + (frame.emotion ?? frame.dominant_emotion ?? '').slice(1)}
                  </Text>
                </View>
                <Text style={[s.probPct, { color: C.primary }]}>
                  {((frame.confidence ?? frame.score ?? 0) * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        )}
        {Object.keys(allProbs).length > 0 && (
          <View style={s.card}>
            <Text style={s.cardLbl}>All Detected Emotions</Text>
            {Object.entries(allProbs).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
              <View key={emo} style={s.probRow}>
                <Icon name={getEmotionIcon(emo)} size={16} color={C.primary} />
                <Text style={s.probLbl}>  {emo.charAt(0).toUpperCase() + emo.slice(1)}</Text>
                <View style={s.probWrap}>
                  <View style={[s.probFill, { width: `${prob * 100}%`, backgroundColor: C.primary }]} />
                </View>
                <Text style={[s.probPct, { color: C.primary }]}>{(prob * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
    return <ResultsScreen data={videoResults} title="Video Results" sub={`${frameCount} frames analysed`} onReset={resetAll} extra={extra} />;
  }

  // ── Camera / Preview ──────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={s.header}>
        <View style={s.decor} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.85)" /><Text style={s.backTxt}> Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Facial Analysis</Text>
        <Text style={s.headerSub}>Photo or short video</Text>
      </View>

      {isOffline && (
        <View style={s.offlineBanner}>
          <Icon name="wifi-off" size={16} color="#fff" />
          <Text style={s.bannerTxt}> Offline — files saved, auto-analysed on reconnect</Text>
        </View>
      )}
      {pendingCount > 0 && !isOffline && (
        <TouchableOpacity style={s.syncBanner} onPress={syncQueue} disabled={isSyncing} activeOpacity={0.85}>
          <View style={s.syncRow}>
            {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="cloud-sync" size={16} color="#fff" />}
            <Text style={s.syncTxt}>  {isSyncing ? `Analysing ${pendingCount} saved file(s)…` : `${pendingCount} saved file(s) — Tap to analyse`}</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={s.tabBar}>
        {['photo', 'video'].map(tab => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => { setActiveTab(tab); setInputType(tab); resetAll(); }} activeOpacity={0.85}>
            <Icon name={tab === 'photo' ? 'camera' : 'video'} size={16} color={activeTab === tab ? C.primary : C.textLight} />
            <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}> {tab === 'photo' ? 'Photo' : 'Video'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'preview' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {capturedImage && <Image source={{ uri: capturedImage }} style={s.previewImg} resizeMode="cover" />}
          {capturedVideo && <VideoView player={player} style={s.previewImg} contentFit="cover" />}

          {savedItem && (
            <View style={s.savedCard}>
              <View style={s.savedTitle}>
                <Icon name="content-save" size={16} color={C.accentOrange} />
                <Text style={s.savedTitleTxt}> Saved Locally</Text>
              </View>
              <Text style={s.savedDesc}>Reconnect to analyse, or use Text Analysis.</Text>
              <View style={s.savedRow}>
                <TouchableOpacity style={s.retryBtn} onPress={retryNow} activeOpacity={0.85}>
                  <Icon name="refresh" size={14} color="#fff" /><Text style={s.retryTxt}> Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.textSwitchBtn} onPress={() => navigation.navigate('TextAnalysis')} activeOpacity={0.85}>
                  <Icon name="text-box-edit-outline" size={14} color={C.primary} /><Text style={s.textSwitchTxt}> Use Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isAnalyzing && (
            <View style={s.loadCard}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={s.loadTxt}>{loadingMsg}</Text>
              {inputType === 'video' && uploadProgress > 0 && (
                <View style={[s.bar, { width: '80%', marginTop: 10 }]}>
                  <View style={[s.barFill, { width: `${uploadProgress}%`, backgroundColor: C.primary }]} />
                </View>
              )}
              <Text style={s.loadSub}>
                {inputType === 'video'
                  ? 'Uploading and analysing · 30–60 seconds'
                  : 'Powered by Hugging Face · May take up to 60s on first use'}
              </Text>
            </View>
          )}

          {!isAnalyzing && !savedItem && (
            <View style={s.previewActions}>
              <TouchableOpacity style={s.bigBtn} onPress={analyzeMedia} activeOpacity={0.85}>
                <Icon name="magnify" size={18} color="#fff" /><Text style={s.bigBtnTxt}> Analyse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.retakeBtn} onPress={resetAll} activeOpacity={0.85}>
                <Icon name="camera-retake" size={18} color={C.primary} /><Text style={s.retakeTxt}> Retake</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {mode === 'camera' && (
        <>
          <View style={s.cameraWrap}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} mode={activeTab === 'video' ? 'video' : 'picture'} />
            {/* Overlay outside CameraView — avoids children warning */}
            <View style={s.overlay} pointerEvents="none">
              <View style={s.faceGuide} />
              <Text style={s.guideLabel}>Align face here</Text>
            </View>
            {isRecording && (
              <View style={s.recBadge}>
                <View style={s.recDot} />
                <Text style={s.recTxt}>REC</Text>
              </View>
            )}
          </View>

          <View style={s.controls}>
            <TouchableOpacity style={s.sideBtn}
              onPress={activeTab === 'photo' ? pickImageFromGallery : pickVideoFromGallery} activeOpacity={0.85}>
              <Icon name="image-multiple" size={26} color={C.textMid} />
              <Text style={s.sideLbl}>Gallery</Text>
            </TouchableOpacity>

            {activeTab === 'photo' ? (
              <TouchableOpacity style={s.captureBtn} onPress={takePicture} activeOpacity={0.75}>
                <View style={s.captureRing}>
                  <View style={s.captureFill} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={s.captureBtn} onPress={isRecording ? stopRecording : startRecording} activeOpacity={0.75}>
                <View style={s.captureRing}>
                  {isRecording
                    ? <View style={s.captureStop} />
                    : <View style={s.captureFill} />
                  }
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.sideBtn} onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')} activeOpacity={0.85}>
              <Icon name="camera-flip" size={26} color={C.textMid} />
              <Text style={s.sideLbl}>Flip</Text>
            </TouchableOpacity>
          </View>

          <View style={s.tipsInline}>
            <Icon name="lightbulb-outline" size={13} color={C.textMid} />
            <Text style={s.tipsTxt}>
              {'  '}{activeTab === 'photo' ? 'Good lighting improves accuracy · Fast 2–3 second analysis' : 'Max 10 seconds · Good lighting · Face camera directly'}
            </Text>
          </View>
        </>
      )}

      <CrisisAlert visible={showCrisisAlert} onClose={() => setShowCrisis(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { backgroundColor: C.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden' },
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
  tabBar:         { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  tab:            { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive:      { borderBottomColor: C.primary },
  tabTxt:         { fontSize: 14, color: C.textLight, fontWeight: '600' },
  tabTxtActive:   { color: C.primary },
  cameraWrap:     { flex: 1, margin: 14, borderRadius: 20, overflow: 'hidden' },
  overlay:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  faceGuide:      { width: 180, height: 220, borderRadius: 90, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.8)', borderStyle: 'dashed' },
  guideLabel:     { color: '#fff', marginTop: 14, fontSize: 13, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  recBadge:       { position: 'absolute', top: 14, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  recDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accentRed, marginRight: 6 },
  recTxt:         { color: '#fff', fontWeight: '700', fontSize: 13 },
  controls:       { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  sideBtn:        { alignItems: 'center', padding: 8 },
  sideLbl:        { fontSize: 10, color: C.textMid, marginTop: 3, fontWeight: '600' },
  captureBtn:     { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  captureRing:    { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  captureFill:    { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.85)' },
  captureStop:    { width: 24, height: 24, borderRadius: 5, backgroundColor: C.accentRed },
  tipsInline:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingVertical: 10 },
  tipsTxt:        { fontSize: 12, color: C.textMid, lineHeight: 18, flex: 1 },
  previewImg:     { width: '92%', height: 240, alignSelf: 'center', borderRadius: 18, marginTop: 14 },
  previewActions: { padding: 16, gap: 10 },
  savedCard:      { margin: 16, backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: C.accentOrange },
  savedTitle:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  savedTitleTxt:  { fontSize: 14, fontWeight: '700', color: C.text },
  savedDesc:      { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 14 },
  savedRow:       { flexDirection: 'row', gap: 10 },
  retryBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, padding: 12, borderRadius: 12 },
  retryTxt:       { color: '#fff', fontSize: 13, fontWeight: '700' },
  textSwitchBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight, padding: 12, borderRadius: 12 },
  textSwitchTxt:  { color: C.primary, fontSize: 13, fontWeight: '700' },
  loadCard:       { alignItems: 'center', padding: 28, margin: 16 },
  loadTxt:        { marginTop: 14, fontSize: 15, fontWeight: '700', color: C.primary },
  loadSub:        { marginTop: 4, fontSize: 12, color: C.textLight },
  body:           { padding: 16 },
  resultImg:      { width: '92%', height: 200, alignSelf: 'center', borderRadius: 18, marginTop: 14 },
  resultHero:     { backgroundColor: C.card, borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 12, borderTopWidth: 4, borderWidth: 1, borderColor: C.border, elevation: 3, gap: 6 },
  resultEmo:      { fontSize: 26, fontWeight: '700', color: C.text },
  resultConf:     { fontSize: 13, color: C.textMid },
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
  probRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  probLbl:        { fontSize: 12, color: C.text, width: 110 },
  probWrap:       { flex: 1, height: 7, backgroundColor: C.primaryLight, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probFill:       { height: '100%', borderRadius: 4 },
  probPct:        { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  frameRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  frameDot:       { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  frameTime:      { fontSize: 11, color: C.textLight, fontWeight: '600' },
  frameEmo:       { fontSize: 13, color: C.text, fontWeight: '600' },
  bigBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, borderRadius: 14, padding: 15, elevation: 2 },
  bigBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  retakeBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight, borderRadius: 14, padding: 15 },
  retakeTxt:      { color: C.primary, fontSize: 15, fontWeight: '700' },
});