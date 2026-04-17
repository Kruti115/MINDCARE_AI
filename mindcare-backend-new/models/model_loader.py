import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from utils.analysis import analyze_sentiment, extract_linguistic_features, calculate_wellness_score, get_interpretation, detect_crisis_indicators

class TextAnalysisModel:
    def __init__(self, model_name=None):
        print("LOADING FROM HUGGING FACE HUB")
        if model_name is None:
            model_name = os.environ.get('MODEL_NAME', 'distilbert-base-uncased-finetuned-sst-2-english')
        self.model_name = model_name
        print(f"Model: {self.model_name}")
        hf_token = os.environ.get('HUGGINGFACE_TOKEN')
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, token=hf_token)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name, token=hf_token)
        self.model.to(self.device)
        self.model.eval()
        self.id_to_label = self.model.config.id2label
        self.label_to_id = self.model.config.label2id
        print(f"MODEL LOADED: {list(self.id_to_label.values())}")
    
    def predict_emotion(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(predictions, dim=-1).item()
        confidence = predictions[0][predicted_class].item()
        all_probs = predictions[0].cpu().numpy()
        return {'primary': self.id_to_label.get(predicted_class, 'neutral'), 'confidence': float(confidence), 'all_probabilities': {self.id_to_label.get(i, f'label_{i}'): float(prob) for i, prob in enumerate(all_probs)}}
    
    def analyze(self, text):
        emotion = self.predict_emotion(text)
        sentiment = analyze_sentiment(text)
        features = extract_linguistic_features(text)
        wellness_score = calculate_wellness_score(emotion['primary'], sentiment, features)
        interpretation = get_interpretation(wellness_score, emotion['primary'])
        crisis_info = detect_crisis_indicators(text, wellness_score)
        return {'emotion': emotion, 'sentiment': sentiment, 'linguistic_features': features, 'wellness_score': float(wellness_score), 'interpretation': interpretation, 'crisis_indicators': crisis_info, 'model_name': self.model_name}

_text_model = None

def get_text_model():
    global _text_model
    if _text_model is None:
        _text_model = TextAnalysisModel()
    return _text_model