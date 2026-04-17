// src/components/CrisisAlert.js - UPDATED WITH "VIEW ALL HELPLINES" NAVIGATION
import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C } from '../theme';

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

const OrgCard = ({ org }) => {
  const [expanded, setExpanded] = useState(false);

  const callNumber = (num) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() =>
      Alert.alert('Error', 'Could not open dialer.')
    );
  };

  const openWebsite = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open website.')
    );
  };

  return (
    <View style={[styles.orgCard, { borderLeftColor: org.color }]}>
      <TouchableOpacity style={styles.orgHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.orgTitleRow}>
          <Text style={styles.orgEmoji}>{org.emoji}</Text>
          <View style={styles.orgTitleText}>
            <Text style={styles.orgName}>{org.name}</Text>
            <Text style={styles.orgTagline}>{org.tagline}</Text>
          </View>
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.callButton, { backgroundColor: org.color }]}
        onPress={() => callNumber(org.number)}
      >
        <Text style={styles.callButtonText}>📞 {org.display}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.orgDetails}>
          {org.altNumber && (
            <TouchableOpacity
              style={styles.altCallButton}
              onPress={() => callNumber(org.altNumber)}
            >
              <Text style={styles.altCallText}>📞 Alt: {org.altNumber}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{org.hours}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}></Text>
            <Text style={styles.detailText}>{org.languages.join(' • ')}</Text>
          </View>
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={() => openWebsite(org.website)}
          >
            <Text style={styles.websiteText}>
              🌐 {org.website.replace('https://', '').replace('http://', '')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ✅ Accept navigation as optional prop — fallback to useNavigation hook
export default function CrisisAlert({ visible, onClose, navigation: navProp }) {
  // useNavigation works when CrisisAlert is rendered inside a screen
  let navigation;
  try {
    navigation = navProp || useNavigation();
  } catch {
    navigation = null;
  }

  const callEmergency = () => {
    Linking.openURL('tel:112').catch(() =>
      Alert.alert('Error', 'Could not open dialer.')
    );
  };

  const goToHelplines = () => {
    onClose(); // close modal first
    setTimeout(() => {
      if (navigation) {
        navigation.navigate('Helpline');
      }
    }, 300); // small delay so modal closes smoothly before navigating
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>💙</Text>
            <Text style={styles.headerTitle}>You're Not Alone</Text>
            <Text style={styles.headerSubtitle}>
              Your wellness score suggests you may be going through a difficult time.
              Reaching out is a sign of strength — help is available right now.
            </Text>
          </View>

          {/* Emergency Banner */}
          <TouchableOpacity style={styles.emergencyBanner} onPress={callEmergency}>
            <Text style={styles.emergencyText}>Life-threatening emergency? Call 112</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Helplines — Tap to expand & call</Text>

          <ScrollView style={styles.orgList} showsVerticalScrollIndicator={false}>
            {ORGANIZATIONS.map(org => (
              <OrgCard key={org.id} org={org} />
            ))}

            <View style={styles.bottomNote}>
              <Text style={styles.bottomNoteText}>
                💬 All helplines are confidential. You deserve support.
              </Text>
              <Text style={styles.bottomNoteSubText}>
                Ambulance: 102 · Emergency: 112
              </Text>
            </View>
            <View style={{ height: 10 }} />
          </ScrollView>

          {/* ✅ View All Helplines Button */}
          <TouchableOpacity style={styles.viewAllButton} onPress={goToHelplines}>
            <Text style={styles.viewAllButtonText}>View Full Helpline Page</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>I'm okay for now</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 10,
  },
  header: {
    backgroundColor: '#5C6BC0',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  headerSubtitle: {
    fontSize: 14, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center', lineHeight: 20,
  },
  emergencyBanner: {
    backgroundColor: '#D32F2F', marginHorizontal: 16,
    marginTop: 14, padding: 14, borderRadius: 12, alignItems: 'center',
  },
  emergencyText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: {
    fontSize: 14, fontWeight: 'bold', color: '#555',
    marginHorizontal: 16, marginTop: 14, marginBottom: 6,
  },
  orgList: { paddingHorizontal: 16 },
  orgCard: {
    backgroundColor: 'white', borderRadius: 12, marginBottom: 10,
    borderLeftWidth: 5, elevation: 2, overflow: 'hidden',
  },
  orgHeader: { padding: 12 },
  orgTitleRow: { flexDirection: 'row', alignItems: 'center' },
  orgEmoji: { fontSize: 22, marginRight: 10 },
  orgTitleText: { flex: 1 },
  orgName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  orgTagline: { fontSize: 12, color: '#777', marginTop: 1 },
  expandIcon: { fontSize: 12, color: '#999', paddingLeft: 8 },
  callButton: {
    marginHorizontal: 12, marginBottom: 12,
    padding: 10, borderRadius: 8, alignItems: 'center',
  },
  callButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  orgDetails: {
    paddingHorizontal: 12, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 2,
  },
  altCallButton: {
    marginTop: 8, padding: 8, borderRadius: 8,
    backgroundColor: '#F5F5F5', alignItems: 'center', marginBottom: 6,
  },
  altCallText: { fontSize: 14, color: '#444', fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  detailIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
  detailText: { fontSize: 13, color: '#555', flex: 1, lineHeight: 18 },
  websiteButton: {
    marginTop: 8, padding: 8, borderRadius: 8,
    backgroundColor: '#E8F5E9', alignItems: 'center',
  },
  websiteText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  bottomNote: {
    backgroundColor: '#E8EAF6', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  bottomNoteText: { fontSize: 13, color: '#3949AB', fontWeight: '600', textAlign: 'center' },
  bottomNoteSubText: { fontSize: 12, color: '#5C6BC0', marginTop: 4 },

  // ✅ New button
  viewAllButton: {
    backgroundColor: '#5C6BC0', marginHorizontal: 16,
    marginTop: 12, padding: 14, borderRadius: 12, alignItems: 'center',
  },
  viewAllButtonText: { fontSize: 15, color: 'white', fontWeight: 'bold' },

  closeButton: {
    backgroundColor: '#ECEFF1', marginHorizontal: 16,
    marginTop: 8, padding: 14, borderRadius: 12, alignItems: 'center',
  },
  closeButtonText: { fontSize: 15, color: '#607D8B', fontWeight: '600' },
});