// src/utils/moodExport.js
// Uses expo-file-system/legacy for SDK 54+ compatibility
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const MOOD_KEY    = 'moodHistory';
const pad         = n => String(n).padStart(2, '0');
const fmtDate     = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fmtTime     = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtReadable = ts => new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

const writeAndShare = async (content, filename, mimeType) => {
  const path = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(path, content, { encoding: 'utf8' });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType, dialogTitle: filename });
  } else {
    Alert.alert('Saved', `File saved to:\n${path}`);
  }
};

// ── CSV Export ─────────────────────────────────────────────────────────────
export const exportCSV = async () => {
  try {
    const raw     = await AsyncStorage.getItem(MOOD_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    if (entries.length === 0) { Alert.alert('No Data', 'No mood history to export yet.'); return; }

    const headers = 'Date,Time,Emotion,Wellness Score,Label,Modality';
    const rows    = entries.map(e => {
      const score = e.wellnessScore || 5;
      const label = score >= 7 ? 'Positive' : score >= 5 ? 'Balanced' : score >= 3.5 ? 'Difficult' : 'Support Needed';
      return [fmtDate(e.timestamp), fmtTime(e.timestamp), e.emotion || 'unknown', score.toFixed(1), label, e.modality || 'unknown'].join(',');
    });

    await writeAndShare([headers, ...rows].join('\n'), `MindCare_${fmtDate(Date.now())}.csv`, 'text/csv');
  } catch (e) {
    console.error('exportCSV error:', e);
    Alert.alert('Export Failed', e.message);
  }
};

// ── TXT Summary Export ─────────────────────────────────────────────────────
export const exportSummary = async () => {
  try {
    const raw     = await AsyncStorage.getItem(MOOD_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    if (entries.length === 0) { Alert.alert('No Data', 'No mood history to export yet.'); return; }

    const total = entries.length;
    const avg   = (entries.reduce((s, e) => s + (e.wellnessScore || 5), 0) / total).toFixed(1);
    const best  = entries.reduce((a, b) => (b.wellnessScore||5) > (a.wellnessScore||5) ? b : a);
    const worst = entries.reduce((a, b) => (b.wellnessScore||5) < (a.wellnessScore||5) ? b : a);
    const freq  = {};
    entries.forEach(e => { freq[e.emotion] = (freq[e.emotion] || 0) + 1; });
    const top   = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

    const lines = [
      'MindCare AI - Wellness Summary',
      'Generated: ' + fmtReadable(Date.now()),
      '--------------------------------------',
      '',
      'OVERVIEW',
      '  Total Analyses   : ' + total,
      '  Average Wellness : ' + avg + ' / 10',
      '  Top Emotion      : ' + (top ? top[0] + ' (' + top[1] + 'x)' : 'N/A'),
      '',
      'BEST & WORST',
      '  Best  : ' + fmtReadable(best.timestamp) + ' - ' + (best.wellnessScore||5).toFixed(1) + '/10 (' + (best.emotion||'unknown') + ')',
      '  Worst : ' + fmtReadable(worst.timestamp) + ' - ' + (worst.wellnessScore||5).toFixed(1) + '/10 (' + (worst.emotion||'unknown') + ')',
      '',
      '--------------------------------------',
      'FULL HISTORY (newest first)',
      '',
      ...entries.slice(0, 50).map((e, i) => {
        const sc = (e.wellnessScore || 5).toFixed(1);
        const lb = sc >= 7 ? 'Positive' : sc >= 5 ? 'Balanced' : sc >= 3.5 ? 'Difficult' : 'Support Needed';
        return (i+1) + '. ' + fmtReadable(e.timestamp) + ' ' + fmtTime(e.timestamp) + '\n   ' + (e.emotion||'unknown') + ' | ' + sc + '/10 | ' + lb + ' | ' + (e.modality||'unknown');
      }),
      total > 50 ? '\n... and ' + (total - 50) + ' more entries' : '',
    ];

    await writeAndShare(lines.join('\n'), `MindCare_Summary_${fmtDate(Date.now())}.txt`, 'text/plain');
  } catch (e) {
    console.error('exportSummary error:', e);
    Alert.alert('Export Failed', e.message);
  }
};