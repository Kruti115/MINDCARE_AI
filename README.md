# 🧠 MindCare AI – Multimodal Mental Health Companion

## 📌 Overview
MindCare AI is a multimodal mental health companion that analyzes a user’s emotional state using text, speech, and facial expressions.  
The system combines multiple AI models to generate a unified wellness score (0–10) and provides early emotional insights and crisis support.


## 🚀 Features
- Text Emotion Analysis (RoBERTa – 28 emotions)  
- Speech Emotion Recognition (MFCC + CNN)  
- Facial Emotion Detection (CNN – FER-2013)  
- Multimodal Fusion System (Text 40%, Audio 30%, Video 30%)  
- Wellness Score (0–10)  
- Crisis Detection with Helpline Support  
- 7-Day Mood Tracking  
- Offline Data Handling  
- Privacy-first (Local Storage)  


## 🧠 How It Works
1. User provides input (text / audio / image / multimodal)  
2. Each modality is processed using dedicated AI models  
3. Outputs are converted into individual scores  
4. Scores are combined using weighted fusion  
5. Final wellness score is generated  
6. Crisis detection triggers alerts if needed  


## 🏗️ System Architecture
### Frontend
- React Native (Expo)
### Backend
- FastAPI (Python)
### Models
- NLP: RoBERTa (GoEmotions)
- Audio: CNN + MFCC (RAVDESS)
- Facial: CNN (FER-2013)
### Storage
- AsyncStorage (Local)
### Deployment
- Hugging Face Spaces


## ⚙️ Tech Stack
- Languages: Python, JavaScript  
- Frameworks: React Native, FastAPI  
- Libraries: Transformers, OpenCV, NumPy, Pandas, Scikit-learn  
- Tools: Expo, Git  


## 📊 Scoring System
W_final = 0.40 × W_text + 0.30 × W_audio + 0.30 × W_video

Range:
- 7–10 → Positive  
- 5–6.9 → Neutral  
- 3.5–4.9 → Low  
- ≤ 3 → Crisis  


## 🚨 Crisis Detection
If score ≤ 3, system triggers:
- Alert message  
- Verified Indian mental health helplines  


## 📈 Performance
- Speech Model Accuracy: ~72%  
- Facial Model Accuracy: ~65%  
- System Usability Score (SUS): 88.88 (Excellent)  


## 📂 Project Structure
mindcare-ai/
│
├── frontend/        
├── backend/         
├── models/          
├── utils/           
└── README.md        


## ⚠️ Limitations
- Not clinically validated  
- Performance affected by noise (audio)  
- Deployment latency (free hosting)  


## 🔮 Future Improvements
- Clinical validation (PHQ-9 integration)  
- Improved model accuracy  
- Cloud-based data sync  
- Real-time emotion tracking  


## 📌 Disclaimer
This application is not a substitute for professional medical advice.  
It is intended for emotional awareness and support only.


## 👩‍💻 Author
Kruti Gupta  
LinkedIn: https://www.linkedin.com/in/kruti-gupta-data/  
GitHub: https://github.com/Kruti115  
