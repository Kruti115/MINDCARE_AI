from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

vader = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    scores = vader.polarity_scores(text)
    return {'compound': scores['compound'], 'positive': scores['pos'], 'negative': scores['neg'], 'neutral': scores['neu']}

def extract_linguistic_features(text):
    words = text.lower().split()
    return {'word_count': len(words), 'negative_words': 0, 'first_person': sum(1 for w in words if w in ['i', 'me', 'my'])}

def calculate_wellness_score(emotion, sentiment, features):
    base = {'joy': 8, 'positive': 8, 'neutral': 5, 'sadness': 3, 'negative': 3, 'anxiety': 3, 'anger': 2}.get(emotion.lower(), 5)
    return max(0, min(10, base + sentiment.get('compound', 0) * 2))

def get_interpretation(score, emotion):
    if score >= 7:
        return f"Positive state with {emotion}"
    elif score >= 4:
        return f"Balanced state"
    else:
        return f"Experiencing {emotion} - consider support"

def detect_crisis_indicators(text, score):
    crisis = score < 3
    return {'crisis_detected': crisis, 'recommendation': 'Seek support' if crisis else 'Monitor wellness'}