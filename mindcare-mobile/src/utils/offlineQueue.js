// src/utils/offlineQueue.js
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use legacy import — Expo SDK 52+ moved to new File/Directory classes
// but the legacy API still works and avoids the breaking-change deprecation warnings
import * as FileSystem from 'expo-file-system/legacy';
import { saveMoodEntry } from './moodStorage';

// ── Copies a file from Expo cache → permanent documentDirectory ─────────────
// Expo cache (AudioSession, tmp) gets wiped on app restart / OS memory pressure.
// documentDirectory persists until the app is uninstalled.
export const copyToPermStorage = async (uri, prefix = 'audio') => {
  try {
    const filename = `${prefix}_${Date.now()}.m4a`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (e) {
    console.warn('copyToPermStorage failed, using original uri:', e.message);
    return uri;  // fallback to original if copy fails
  }
};

// ── Check if a local file URI actually exists ─────────────────────────────
const fileExists = async (uri) => {
  if (!uri || !uri.startsWith('file://')) return true; // non-file URIs skip check
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
};

const QUEUE_KEY = 'offlineAnalysisQueue';
const API_BASE  = 'https://Kruti1234-mindcare-backend-v2.hf.space/api/v1';

// ── Processing lock — prevents processQueue() running multiple times in parallel
let _isProcessing = false;

export const addToQueue = async (item) => {
  try {
    const queue = await getQueue();
    const entry = { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, timestamp: new Date().toISOString(), ...item };
    queue.push(entry);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return entry.id;
  } catch (e) { console.error('addToQueue error:', e); return null; }
};

export const getQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const getQueueCount = async (type) => {
  const q = await getQueue();
  return type ? q.filter(i => i.type === type).length : q.length;
};

export const removeFromQueue = async (id) => {
  try {
    const queue = await getQueue();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(i => i.id !== id)));
  } catch (e) { console.error('removeFromQueue error:', e); }
};

export const clearQueue = async () => AsyncStorage.removeItem(QUEUE_KEY);

// ── processQueue — safe to call from anywhere, will never run twice simultaneously
export const processQueue = async (onItemProcessed) => {
  // If already running, bail out immediately — this is what stops the loop
  if (_isProcessing) {
    console.log('processQueue already running, skipping.');
    return 0;
  }

  const queue = await getQueue();
  if (!queue.length) return 0;

  _isProcessing = true;
  let processed = 0;

  try {
    for (const item of queue) {
      try {
        let response = null;

        // ── Check all file URIs exist before attempting upload ─────────────
        // Expo cache is wiped on restart — a missing file would throw
        // "Network request failed" and retry forever. Instead we detect it
        // early and remove the stale item from the queue.
        const urisToCheck = [item.uri, item.audioUri, item.imageUri].filter(Boolean);
        let filesOk = true;
        for (const u of urisToCheck) {
          const exists = await fileExists(u);
          if (!exists) {
            console.warn(`Queue item ${item.id}: file no longer exists (${u}). Removing.`);
            await removeFromQueue(item.id);
            filesOk = false;
            break;
          }
        }
        if (!filesOk) continue;

        // ── AUDIO ──────────────────────────────────────────────────────────
        if (item.type === 'audio' && item.uri) {
          const fd = new FormData();
          fd.append('audio_file', { uri: item.uri, type: 'audio/m4a', name: 'audio.m4a' });
          const res = await fetch(`${API_BASE}/analyze-audio`, {
            method: 'POST',
            body: fd,
            // Do NOT manually set Content-Type — let fetch set it with the boundary
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          response = await res.json();
          if (response?.status === 'success') {
            await saveMoodEntry(response.data, { hasAudio: true });
          }
        }

        // ── IMAGE ──────────────────────────────────────────────────────────
        if (item.type === 'image' && item.uri) {
          const fd = new FormData();
          fd.append('image_file', { uri: item.uri, type: 'image/jpeg', name: 'photo.jpg' });
          const res = await fetch(`${API_BASE}/analyze-video`, {
            method: 'POST',
            body: fd,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          response = await res.json();
          if (response?.status === 'success') {
            await saveMoodEntry(response.data, { inputImageUri: item.uri });
          }
        }

        // ── VIDEO ──────────────────────────────────────────────────────────
        if (item.type === 'video' && item.uri) {
          const fd = new FormData();
          fd.append('video_file', { uri: item.uri, type: 'video/mp4', name: 'video.mp4' });
          const res = await fetch(`${API_BASE}/analyze-video-upload`, {
            method: 'POST',
            body: fd,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          response = await res.json();
          if (response?.status === 'success') {
            await saveMoodEntry(response.data, { hasVideo: true });
          }
        }

        // ── MULTIMODAL ─────────────────────────────────────────────────────
        if (item.type === 'multimodal') {
          const fd = new FormData();
          if (item.text)     fd.append('text', item.text);
          if (item.audioUri) fd.append('audio_file', { uri: item.audioUri, type: 'audio/m4a', name: 'audio.m4a' });
          if (item.imageUri) fd.append('image_file', { uri: item.imageUri, type: 'image/jpeg', name: 'photo.jpg' });
          const res = await fetch(`${API_BASE}/analyze-multimodal`, {
            method: 'POST',
            body: fd,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          response = await res.json();
          if (response?.status === 'success') {
            await saveMoodEntry(response.data, {
              inputText: item.text || null,
              inputImageUri: item.imageUri || null,
              hasAudio: !!item.audioUri,
            });
          }
        }

        // ── Remove from queue only on confirmed success ────────────────────
        if (response?.status === 'success') {
          await removeFromQueue(item.id);
          processed++;
          onItemProcessed?.(item, response.data);
        }

      } catch (e) {
        // Individual item failed — log and continue to next item, don't crash whole queue
        console.log(`Queue item ${item.id} (${item.type}) failed: ${e.message}. Will retry next time.`);
      }
    }
  } finally {
    // ALWAYS release the lock, even if something throws
    _isProcessing = false;
  }

  return processed;
};