// src/screens/ResultsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ResultsScreen({ route, navigation }) {
  const { result, inputText } = route.params;
  const data = result.data;

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: '#4CAF50',
      sadness: '#2196F3',
      anger: '#F44336',
      anxiety: '#FF9800',
      neutral: '#9E9E9E'
    };
    return colors[emotion?.toLowerCase()] || '#9E9E9E';
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      anxiety: '😰',
      neutral: '😐'
    };
    return emojis[emotion?.toLowerCase()] || '😐';
  };

  const getScoreDescription = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    if (score >= 2) return 'Concerning';
    return 'Critical';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Mode Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {result.mode === 'online' ? '🌐 Online AI Analysis' : '📱 Offline Basic Analysis'}
        </Text>
      </View>

      {/* Input Text Display */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Input:</Text>
        <Text style={styles.inputText}>"{inputText}"</Text>
      </View>

      {/* Emotion Result - Main Card */}
      <View style={[styles.card, styles.emotionCard, { borderLeftWidth: 5, borderLeftColor: getEmotionColor(data.emotion.primary) }]}>
        <Text style={styles.emojiLarge}>
          {getEmotionEmoji(data.emotion.primary)}
        </Text>
        <Text 
          style={[
            styles.emotion,
            { color: getEmotionColor(data.emotion.primary) }
          ]}
        >
          {data.emotion.primary?.toUpperCase()}
        </Text>
        <Text style={styles.confidence}>
          Confidence: {((data.emotion.confidence || 0) * 100).toFixed(1)}%
        </Text>
      </View>

      {/* Wellness Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wellness Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getEmotionColor(data.emotion.primary) }]}>
            {(data.wellness_score || 0).toFixed(1)}
          </Text>
          <Text style={styles.scoreMax}> / 10</Text>
        </View>
        <Text style={styles.scoreDescription}>
          {getScoreDescription(data.wellness_score)}
        </Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreBarFill,
              { 
                width: `${(data.wellness_score || 0) * 10}%`,
                backgroundColor: getEmotionColor(data.emotion.primary)
              }
            ]}
          />
        </View>
      </View>

      {/* Interpretation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💭 Interpretation</Text>
        <Text style={styles.interpretation}>
          {data.interpretation || 'No interpretation available'}
        </Text>
      </View>

      {/* Crisis Alert (if detected) */}
      {data.crisis_indicators && data.crisis_indicators.crisis_detected && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertTitle}>Support Recommended</Text>
          <Text style={styles.alertText}>
            {data.crisis_indicators.recommendation}
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Find Support Resources</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* All Probabilities (if available) */}
      {result.mode === 'online' && data.emotion.all_probabilities && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Detailed Breakdown</Text>
          {Object.entries(data.emotion.all_probabilities).map(([emotion, prob]) => (
            <View key={emotion} style={styles.probRow}>
              <Text style={styles.probLabel}>
                {getEmotionEmoji(emotion)} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </Text>
              <View style={styles.probBarContainer}>
                <View 
                  style={[
                    styles.probBar,
                    { 
                      width: `${(prob * 100).toFixed(1)}%`,
                      backgroundColor: getEmotionColor(emotion)
                    }
                  ]}
                />
              </View>
              <Text style={styles.probValue}>{(prob * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TextAnalysis')}
        >
          <Text style={styles.buttonText}>🔄 Analyze Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20
  },
  badgeText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600'
  },
  inputText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20
  },
  emotionCard: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emojiLarge: {
    fontSize: 80,
    marginBottom: 15
  },
  emotion: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10
  },
  confidence: {
    fontSize: 16,
    color: '#666'
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 10
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold'
  },
  scoreMax: {
    fontSize: 24,
    color: '#999'
  },
  scoreDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    fontWeight: '600'
  },
  scoreBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden'
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 6
  },
  interpretation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
    alignItems: 'center'
  },
  alertIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10
  },
  alertText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 15
  },
  helpButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  probLabel: {
    width: 100,
    fontSize: 14,
    color: '#333'
  },
  probBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden'
  },
  probBar: {
    height: '100%',
    borderRadius: 4
  },
  probValue: {
    width: 50,
    fontSize: 12,
    color: '#666',
    textAlign: 'right'
  },
  buttonContainer: {
    marginTop: 10
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#2196F3'
  },
  spacer: {
    height: 30
  }
});