// src/theme.js — MindCare AI shared design tokens
export const C = {
  bg:           '#F0F6FF',
  card:         '#FFFFFF',
  primary:      '#4A90D9',
  primaryDark:  '#2C6FAC',
  primaryLight: '#EBF4FF',
  primarySoft:  '#D6EAFF',
  accent:       '#5BB8F5',
  accentGreen:  '#4BBFA5',
  accentOrange: '#F5A623',
  accentRed:    '#E8625A',
  purple:       '#7B6CF6',
  text:         '#1A2E45',
  textMid:      '#4A6580',
  textLight:    '#8BA4BE',
  border:       '#D6E8F7',
};

// Map emotion string → MaterialCommunityIcons icon name
export const getEmotionIcon = (emotion) => {
  const map = {
    happy:    'emoticon-happy-outline',
    joy:      'emoticon-happy-outline',
    sad:      'emoticon-sad-outline',
    sadness:  'emoticon-sad-outline',
    angry:    'emoticon-angry-outline',
    anger:    'emoticon-angry-outline',
    fearful:  'emoticon-confused-outline',
    fear:     'emoticon-confused-outline',
    anxiety:  'emoticon-confused-outline',
    disgust:  'emoticon-sick-outline',
    surprise: 'emoticon-excited-outline',
    surprised:'emoticon-excited-outline',
    neutral:  'emoticon-neutral-outline',
    calm:     'emoticon-cool-outline',
    unknown:  'emoticon-outline',
  };
  return map[emotion?.toLowerCase()] || 'emoticon-outline';
};

export const getWellnessColor = (s) =>
  s >= 7 ? C.accentGreen : s >= 4 ? C.accentOrange : C.accentRed;

export const getWellnessLabel = (s) =>
  s >= 7 ? 'Positive' : s >= 5 ? 'Balanced' : s >= 3.5 ? 'Difficult' : 'Support Needed';

// Modality icon names
export const MODALITY_ICON = {
  text:       'text-box-edit-outline',
  audio:      'microphone-outline',
  video:      'video-outline',
  image:      'image-outline',
  multimodal: 'shuffle-variant',
  photo:      'image-outline',
};

export const MODALITY_LABEL = {
  text:'Text', audio:'Audio', video:'Video',
  image:'Image', multimodal:'Multimodal', photo:'Photo',
};