// src/screens/OnboardingScreen.js
// Shows once on first launch. Sets 'hasOnboarded' flag in AsyncStorage.
// In your App.js / navigator, check this flag and show OnboardingScreen or HomeScreen.

import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import { C } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    tag:   'WELCOME',
    title: 'Your Mental Wellness\nCompanion',
    body:  'MindCare AI helps you understand your emotional state using text, voice, and facial expressions — all in one place.',
    accent: C.primary,
    bg:     C.primaryLight,
  },
  {
    id: '2',
    tag:   'HOW IT WORKS',
    title: 'Three Ways to\nExpress Yourself',
    body:  'Type how you feel, speak naturally, or let your face tell the story. Our AI analyses all three and gives you a combined wellness score.',
    accent: '#5BB8F5',
    bg:     '#E3F6FF',
  },
  {
    id: '3',
    tag:   'TRACK PROGRESS',
    title: 'Watch Your\nWellness Grow',
    body:  'Every analysis is saved. See your 7-day mood trend, spot patterns, and understand what affects your emotional health.',
    accent: C.accentGreen,
    bg:     '#E3F9F5',
  },
  {
    id: '4',
    tag:   'ALWAYS THERE',
    title: 'Crisis Support\nWhen You Need It',
    body:  'If your wellness score drops, the app gently suggests professional helplines. You are never alone.',
    accent: C.accentRed,
    bg:     '#FFF0EE',
  },
  {
    id: '5',
    tag:   'PERMISSIONS',
    title: 'A Few Permissions\nNeeded',
    body:  'MindCare needs microphone access for voice analysis and camera access for facial analysis. Your data stays on your device.',
    accent: C.purple,
    bg:     '#EEF0FF',
    isPermissions: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permGranted, setPermGranted]   = useState(false);
  const flatRef = useRef(null);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      flatRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const requestPermissions = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Camera.requestCameraPermissionsAsync();
      setPermGranted(true);
    } catch (e) {
      console.warn('Permission request failed:', e);
      setPermGranted(true); // allow to proceed anyway
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Home');
  };

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setCurrentIndex(idx);
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide  = SLIDES[currentIndex];

  const renderSlide = ({ item }) => (
    <View style={[s.slide, { backgroundColor: item.bg }]}>
      {/* Big decorative shape */}
      <View style={[s.decor1, { backgroundColor: item.accent + '22' }]} />
      <View style={[s.decor2, { backgroundColor: item.accent + '15' }]} />

      {/* Content */}
      <View style={s.slideContent}>
        <View style={[s.tagPill, { backgroundColor: item.accent }]}>
          <Text style={s.tagTxt}>{item.tag}</Text>
        </View>
        <Text style={[s.slideTitle, { color: C.text }]}>{item.title}</Text>
        <Text style={s.slideBody}>{item.body}</Text>

        {item.isPermissions && (
          <View style={s.permBox}>
            <View style={s.permRow}>
              <View style={[s.permDot, { backgroundColor: C.primary }]} />
              <View>
                <Text style={s.permLabel}>Microphone</Text>
                <Text style={s.permDesc}>For voice emotion analysis</Text>
              </View>
            </View>
            <View style={s.permRow}>
              <View style={[s.permDot, { backgroundColor: C.accentGreen }]} />
              <View>
                <Text style={s.permLabel}>Camera</Text>
                <Text style={s.permDesc}>For facial expression analysis</Text>
              </View>
            </View>
            <View style={s.permRow}>
              <View style={[s.permDot, { backgroundColor: C.accentOrange }]} />
              <View>
                <Text style={s.permLabel}>Storage</Text>
                <Text style={s.permDesc}>To save analyses when offline</Text>
              </View>
            </View>
            <Text style={s.permNote}>
              All data is stored locally on your device. Nothing is shared without your consent.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={slide.bg} />

      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
      />

      {/* Bottom controls */}
      <View style={[s.footer, { backgroundColor: slide.bg }]}>

        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                i === currentIndex
                  ? [s.dotActive, { backgroundColor: slide.accent }]
                  : s.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        {isLast ? (
          <View style={s.btnRow}>
            {!permGranted ? (
              <>
                <TouchableOpacity
                  style={[s.btnPrimary, { backgroundColor: slide.accent }]}
                  onPress={requestPermissions}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnPrimaryTxt}>Grant Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnSkip} onPress={finish}>
                  <Text style={s.btnSkipTxt}>Skip for now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[s.btnPrimary, { backgroundColor: slide.accent }]}
                onPress={finish}
                activeOpacity={0.85}
              >
                <Text style={s.btnPrimaryTxt}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnSkip} onPress={finish}>
              <Text style={s.btnSkipTxt}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnPrimary, { backgroundColor: slide.accent }]}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryTxt}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1 },

  // Slide
  slide:         { width: W, flex: 1, overflow: 'hidden' },
  decor1:        { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110 },
  decor2:        { position: 'absolute', bottom: 80, left: -40, width: 160, height: 160, borderRadius: 80 },
  slideContent:  { flex: 1, paddingHorizontal: 32, paddingTop: H * 0.12, paddingBottom: 20 },
  tagPill:       { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 20 },
  tagTxt:        { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  slideTitle:    { fontSize: 30, fontWeight: '800', lineHeight: 38, marginBottom: 18 },
  slideBody:     { fontSize: 15, color: C.textMid, lineHeight: 24 },

  // Permissions slide
  permBox:       { marginTop: 28, backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 14 },
  permRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  permDot:       { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  permLabel:     { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  permDesc:      { fontSize: 12, color: C.textMid },
  permNote:      { fontSize: 11, color: C.textLight, lineHeight: 17, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginTop: 2 },

  // Footer
  footer:        { paddingHorizontal: 28, paddingBottom: 44, paddingTop: 16 },
  dots:          { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot:           { height: 8, borderRadius: 4 },
  dotActive:     { width: 24 },
  dotInactive:   { width: 8, backgroundColor: C.border },
  btnRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  btnPrimary:    { flex: 1, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSkip:       { paddingHorizontal: 16, paddingVertical: 15 },
  btnSkipTxt:    { fontSize: 14, color: C.textMid, fontWeight: '600' },
});