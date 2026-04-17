# app.py - MindCare Backend - Text + Audio + Video
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import logging
import gc
import io
import os
import numpy as np
import torch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MindCare AI Backend",
    description="Text + Audio + Video Emotion Analysis",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models
TEXT_MODEL = None
TEXT_TOKENIZER = None
AUDIO_MODEL = None
AUDIO_LABEL_ENCODER = None
VIDEO_MODEL = None
VIDEO_CLASS_INDICES = None
SARCASM_MODEL = None
SARCASM_TOKENIZER = None
MODELS_LOADED = {"text": False, "audio": False, "video": False, "sarcasm": False}


# ============================================================================
# MODEL LOADERS
# ============================================================================

def load_text_model():
    global TEXT_MODEL, TEXT_TOKENIZER, MODELS_LOADED
    if MODELS_LOADED["text"]:
        return TEXT_MODEL, TEXT_TOKENIZER
    try:
        logger.info("Loading text emotion model...")
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        # SamLowe/roberta-base-go_emotions: 28 emotions, 83% accuracy on broad categories
        # Trained on Reddit — handles nuanced, complex, everyday language very well
        model_name = "SamLowe/roberta-base-go_emotions"

        TEXT_TOKENIZER = AutoTokenizer.from_pretrained(model_name)
        TEXT_MODEL = AutoModelForSequenceClassification.from_pretrained(model_name)
        TEXT_MODEL.eval()
        for param in TEXT_MODEL.parameters():
            param.requires_grad = False
        MODELS_LOADED["text"] = True
        gc.collect()
        logger.info("✅ Text emotion model loaded!")
        return TEXT_MODEL, TEXT_TOKENIZER
    except Exception as e:
        logger.error(f"❌ Text model failed: {str(e)}")
        raise

# ── ADD THIS NEW FUNCTION AFTER load_text_model() ───────────────────────────
def load_sarcasm_model():
    global SARCASM_MODEL, SARCASM_TOKENIZER, MODELS_LOADED
    if MODELS_LOADED.get("sarcasm"):
        return SARCASM_MODEL, SARCASM_TOKENIZER
    try:
        logger.info("Loading sarcasm detector...")
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        model_name = "helinivan/english-sarcasm-detector"
        SARCASM_TOKENIZER = AutoTokenizer.from_pretrained(model_name)
        SARCASM_MODEL = AutoModelForSequenceClassification.from_pretrained(model_name)
        SARCASM_MODEL.eval()
        for param in SARCASM_MODEL.parameters():
            param.requires_grad = False
        MODELS_LOADED["sarcasm"] = True
        gc.collect()
        logger.info("✅ Sarcasm model loaded!")
        return SARCASM_MODEL, SARCASM_TOKENIZER
    except Exception as e:
        # Sarcasm model is optional — fall back gracefully if it fails
        logger.warning(f"⚠️ Sarcasm model failed to load (non-fatal): {str(e)}")
        return None, None

def load_audio_model():
    global AUDIO_MODEL, AUDIO_LABEL_ENCODER, MODELS_LOADED
    if MODELS_LOADED["audio"]:
        return AUDIO_MODEL, AUDIO_LABEL_ENCODER
    try:
        logger.info("Loading audio model v2...")
        from huggingface_hub import hf_hub_download
        import tensorflow as tf
        import pickle
        repo_id = "Kruti1234/mindcare-audio-emotion"
        model_path = hf_hub_download(repo_id=repo_id, filename="mindcare_audio_emotion_model_v2.h5")
        AUDIO_MODEL = tf.keras.models.load_model(model_path)
        encoder_path = hf_hub_download(repo_id=repo_id, filename="audio_label_encoder_v2.pkl")
        with open(encoder_path, 'rb') as f:
            AUDIO_LABEL_ENCODER = pickle.load(f)
        MODELS_LOADED["audio"] = True
        gc.collect()
        logger.info("✅ Audio model v2 loaded!")
        return AUDIO_MODEL, AUDIO_LABEL_ENCODER
    except Exception as e:
        logger.error(f"❌ Audio model failed: {str(e)}")
        raise


def load_video_model():
    global VIDEO_MODEL, VIDEO_CLASS_INDICES, MODELS_LOADED
    if MODELS_LOADED["video"]:
        return VIDEO_MODEL, VIDEO_CLASS_INDICES
    try:
        logger.info("Loading video model...")
        from huggingface_hub import hf_hub_download
        import tensorflow as tf
        import pickle
        repo_id = "Kruti1234/mindcare-video-emotion"
        model_path = hf_hub_download(repo_id=repo_id, filename="mindcare_video_model.keras")
        VIDEO_MODEL = tf.keras.models.load_model(model_path)
        indices_path = hf_hub_download(repo_id=repo_id, filename="video_class_indices.pkl")
        with open(indices_path, 'rb') as f:
            VIDEO_CLASS_INDICES = pickle.load(f)
        MODELS_LOADED["video"] = True
        gc.collect()
        logger.info("✅ Video model loaded!")
        return VIDEO_MODEL, VIDEO_CLASS_INDICES
    except Exception as e:
        logger.error(f"❌ Video model failed: {str(e)}")
        raise


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class TextAnalysisRequest(BaseModel):
    text: str
    user_id: str = "user123"

class TextAnalysisResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    processing_time: float

class AudioAnalysisResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    processing_time: float

class VideoAnalysisResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    processing_time: float


# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    try:
        logger.info("🚀 Starting MindCare Backend v3...")
        load_text_model()
        load_sarcasm_model()   # pre-warm so first request isn't slow
        load_audio_model()
        load_video_model()
        logger.info("✅ All models loaded!")
    except Exception as e:
        logger.error(f"⚠️ Startup error: {str(e)}")


# ============================================================================
# BASIC ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "MindCare AI Backend - Text + Audio + Video",
        "version": "3.0.0",
        "status": "running",
        "models_loaded": MODELS_LOADED
    }


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mindcare-backend",
        "text_model_loaded": MODELS_LOADED["text"],
        "audio_model_loaded": MODELS_LOADED["audio"],
        "video_model_loaded": MODELS_LOADED["video"]
    }


# ============================================================================
# TEXT ANALYSIS
# ============================================================================

#go_emotions has 28 labels — we map them to our 5 core emotions
# This mapping was designed carefully based on emotional similarity
GO_EMOTIONS_TO_CORE = {
    'admiration': 'joy', 'amusement': 'joy', 'approval': 'joy',
    'caring': 'joy', 'desire': 'joy', 'excitement': 'joy',
    'gratitude': 'joy', 'joy': 'joy', 'love': 'joy',
    'optimism': 'joy', 'pride': 'joy', 'relief': 'joy','contentment':'joy',
    'serenity':'joy','happiness':'joy','delight':'joy','satisfaction':'joy',
    'affection':'joy','cheerfulness':'joy','enthusiasm':'joy','playfulness':'joy',

    'disappointment': 'sadness', 'embarrassment': 'sadness',
    'grief': 'sadness', 'remorse': 'sadness', 'sadness': 'sadness',
    'hurt':'sadness','loneliness':'sadness','shame':'sadness','guilt':'sadness',
    'regret':'sadness','discouragement':'sadness','despair':'sadness',
    'hopelessness':'sadness','homesickness':'sadness','sorrow':'sadness',
    'insecurity':'sadness','self-loathing':'sadness','anguish':'sadness','mourning':'sadness',

    'anger': 'anger', 'annoyance': 'anger', 'disapproval': 'anger',
    'disgust': 'anger','irritation':'anger','frustration':'anger','rage':'anger',
    'fury':'anger','resentment':'anger','bitterness':'anger','agitation':'anger',
    'hate':'anger','vengefulness':'anger','outrage':'anger','contempt':'anger',
    'indignation':'anger',

    'fear': 'anxiety', 'nervousness': 'anxiety', 'confusion': 'anxiety',
    'worry':'anxiety','stress':'anxiety','uneasiness':'anxiety','panic':'anxiety',
    'terror':'anxiety','alarm':'anxiety','dread':'anxiety','insecurity':'anxiety',
    'doubt':'anxiety','restlessness':'anxiety','hypervigilance':'anxiety',
    'phobia response':'anxiety','shock':'anxiety','apprehension':'anxiety',

    'curiosity': 'neutral', 'realization': 'neutral', 'surprise': 'neutral',
    'neutral': 'neutral','interest':'neutral','thoughtfulness':'neutral',
    'contemplation':'neutral','acceptance':'neutral','focus':'neutral',
    'boredom':'neutral','indifference':'neutral','reflection':'neutral',
    'objectivity':'neutral','observation':'neutral','detachment':'neutral',
    'confusion':'neutral','surprise':'neutral'}

HARTMANN_TO_CORE = {
    'anger':    'anger',
    'disgust':  'anger',     # disgust = frustrated/repulsed → maps to anger
    'fear':     'anxiety',
    'joy':      'joy',
    'neutral':  'neutral',
    'sadness':  'sadness',
    'surprise': 'neutral',   # surprise is ambiguous → neutral
}

# ── Wellness scores (no blending across polarities) ──────────────────────────
WELLNESS_SCORES = {
    'joy':     8.5,
    'neutral': 5.0,
    'sadness': 2.5,
    'anxiety': 2.5,
    'anger':   2.0,
}


NEGATIVE_EMOTIONS = {'sadness', 'anxiety', 'anger'}
POSITIVE_EMOTIONS = {'joy'}

# Exhaustion/burnout signals — model often maps these to fear/anxiety incorrectly
BURNOUT_SIGNALS = [
    'tired but', 'tired and', 'exhausted but', 'exhausted and',
    'not able to', 'not being able', 'unable to', 'can\'t seem to',
    'cannot seem', 'want to but', 'trying but', 'trying to but',
    'no motivation', 'demotivated', 'unmotivated', 'burnt out', 'burned out',
    'drained', 'stuck', 'blocked', 'can\'t focus', 'cannot focus',
    'keep failing', 'nothing is working', 'not working out',
]

# Pain/distress signal words — if these appear alongside a "positive"
# model prediction, we downweight joy and boost sadness/anxiety
PAIN_SIGNALS = [
    'affliction', 'anguish', 'agony', 'torment', 'suffering', 'misery',
    'grief', 'sorrow', 'despair', 'desolation', 'heartbreak', 'devastated',
    'shattered', 'broken', 'wounded', 'bleeding', 'hollow',
    'numb', 'void', 'darkness', 'abandoned', 'betrayed',
    'worthless', 'hopeless', 'helpless',
    'overwhelmed', 'tears', 'crying', 'weeping',
    'trauma', 'nightmare', 'haunted', 'trapped', 'suffocating', 'drowning',
    'burnout', 'useless', 'pointless',
    # NOTE: Removed overly broad single words: 'tired', 'exhausted', 'drained',
    # 'hurt', 'pain', 'ache', 'lost', 'alone', 'empty', 'shadow', 'wake',
    # 'echo', 'trusted', 'clandestine', 'reverberates', 'stuck', 'blocked',
    # 'frustrated', 'dying', 'scar', 'wound', 'fatigue', 'can't', 'cannot',
    # 'unable' — these all fire on normal sentences and cause false positives.
]

# Sarcasm/irony signals — positive words used in negative framing
SARCASM_PAIRS = [
    # (positive_word, negative_context_word)
    ('laugh', 'pain'), ('laugh', 'hurt'), ('laugh', 'cry'),
    ('smile', 'tears'), ('smile', 'hurt'), ('smile', 'alone'),
    ('happy', 'pretend'), ('happy', 'fake'), ('happy', 'mask'),
    ('fine', 'not'), ('okay', 'not'), ('great', 'not'),
    ('joy', 'affliction'), ('joy', 'grief'), ('joy', 'sorrow'),
    ('laughter', 'wake'), ('laughter', 'pain'), ('laughter', 'grief'),
    ('good', 'not'), ('well', 'not'), ('fine', 'never'),
]

NEGATION_WORDS = [
    'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
    'hardly', 'barely', 'scarcely', "n't", 'dont', "don't", 'cant',
    "can't", 'wont', "won't", 'isnt', "isn't", 'wasnt', "wasn't",
    'havent', "haven't", 'without', 'lack',
    'unable', 'cannot',
    # NOTE: Removed 'despite', 'though', 'although', 'even though',
    # 'but', 'however', 'yet', 'still' — these are soft conjunctions that
    # appear in perfectly normal positive sentences like
    # "I feel happy, but it's been a long day" and were causing false positives.
]

# ── Frustration/burnout signals (new — catches "tired but not sleepy" type) ──
FRUSTRATION_SIGNALS = [
    'tired', 'exhausted', 'drained', 'burnt out', 'burnout', 'worn out',
    'stuck', 'blocked', 'can\'t focus', 'cannot focus', 'can\'t work',
    'cannot work', 'not able to', 'unable to', 'frustrated', 'frustrating',
    'annoying', 'irritated', 'useless', 'pointless', 'what\'s the point',
    'no motivation', 'demotivated', 'unmotivated', 'procrastinat',
    'keep failing', 'nothing works', 'not working', 'not being able',
]


# def detect_context_flags(text: str):
#     """
#     Returns flags for negation, pain signals, and sarcasm/irony.
#     These are used to adjust model predictions contextually.
#     """
#     text_lower = text.lower()
#     words = set(text_lower.split())

#     has_negation = any(neg in text_lower for neg in NEGATION_WORDS)

#     pain_count = sum(1 for p in PAIN_SIGNALS if p in text_lower)
#     has_pain_signals = pain_count >= 1

#     # Sarcasm: positive word + negative context word co-occur in same text
#     has_sarcasm = any(
#         pos in text_lower and neg in text_lower
#         for pos, neg in SARCASM_PAIRS
#     )

#     return has_negation, has_pain_signals, has_sarcasm, pain_count

# def detect_context_flags(text: str):
#     text_lower = text.lower()

#     has_negation = any(neg in text_lower for neg in NEGATION_WORDS)

#     pain_count = sum(1 for p in PAIN_SIGNALS if p in text_lower)
#     has_pain = pain_count >= 1

#     has_sarcasm = any(
#         pos in text_lower and neg in text_lower
#         for pos, neg in SARCASM_PAIRS
#     )

#     frustration_count = sum(1 for f in FRUSTRATION_SIGNALS if f in text_lower)
#     has_frustration = frustration_count >= 1

#     return has_negation, has_pain, has_sarcasm, pain_count, has_frustration, frustration_count

def detect_context(text: str):
    t = text.lower()

    has_negation = any(n in t for n in NEGATION_WORDS)
    pain_count = sum(1 for p in PAIN_SIGNALS if p in t)
    has_pain = pain_count >= 2   # Raised from 1 → 2: single word like 'hurt' is not enough
    has_burnout = any(b in t for b in BURNOUT_SIGNALS)

    return has_negation, has_pain, has_burnout, pain_count

def check_sarcasm(text: str, sarcasm_model, sarcasm_tokenizer) -> tuple:
    """
    Returns (is_sarcastic: bool, sarcasm_confidence: float)
    Uses dedicated sarcasm model for reliable detection.
    Falls back to False if model unavailable.

    IMPORTANT: helinivan/english-sarcasm-detector was trained on Reddit headlines
    where enthusiastic positive text IS often sarcastic. For general app text it
    over-fires on normal happy sentences. We require BOTH:
      1. Model confidence > 0.80 (raised from 0.55)
      2. At least one sarcasm keyword signal present in the text
    This prevents "I am happy" → sarcasm = True.
    """
    if sarcasm_model is None or sarcasm_tokenizer is None:
        return False, 0.0
    try:
        import string, torch
        cleaned = text.lower().translate(str.maketrans("", "", string.punctuation)).strip()
        inputs = sarcasm_tokenizer(
            cleaned, return_tensors="pt", padding=True,
            truncation=True, max_length=256
        )
        with torch.no_grad():
            outputs = sarcasm_model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)[0].tolist()
        sarcasm_score = probs[1]

        # Raised from 0.55 → 0.80: the model is over-sensitive on positive text
        model_says_sarcastic = sarcasm_score > 0.80

        # Require at least one keyword signal to confirm — prevents false positives
        # on simple happy sentences like "I'm happy" or "Everything is great"
        keyword_signal = any(
            pos in cleaned and neg in cleaned
            for pos, neg in SARCASM_PAIRS
        )

        # Only flag sarcasm if BOTH model AND keywords agree
        is_sarcastic = model_says_sarcastic and keyword_signal

        return is_sarcastic, sarcasm_score
    except Exception as e:
        logger.warning(f"Sarcasm check failed: {e}")
        return False, 0.0

# def aggregate_go_emotions(raw_probs: dict) -> dict:
#     """
#     Aggregates 28 go_emotions probabilities into 5 core emotion scores.
#     Multiple go_emotions can map to the same core emotion — we sum them.
#     """
#     core_scores = {"joy": 0.0, "sadness": 0.0, "anger": 0.0, "anxiety": 0.0, "neutral": 0.0}
#     for label, prob in raw_probs.items():
#         core = GO_EMOTIONS_TO_CORE.get(label)
#         if core:
#             core_scores[core] += prob
#     # Normalize so scores sum to 1
#     total = sum(core_scores.values())
#     if total > 0:
#         core_scores = {k: v / total for k, v in core_scores.items()}
#     return core_scores

def aggregate_go_emotions(raw_probs: dict) -> dict:
    """
    SamLowe model is multi-label with sigmoid (not softmax).
    Each label score is independent probability [0,1].
    We sum into 5 core groups then normalize.
    """
    core_scores = {'joy': 0.0, 'sadness': 0.0, 'anger': 0.0, 'anxiety': 0.0, 'neutral': 0.0}
    for label, prob in raw_probs.items():
        core = GO_EMOTIONS_TO_CORE.get(label)
        if core:
            core_scores[core] += prob
    total = sum(core_scores.values())
    if total > 0:
        core_scores = {k: v / total for k, v in core_scores.items()}
    return core_scores

    
@app.post("/api/v1/analyze-text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    import time
    import torch

    start_time = time.time()

    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        text = request.text.strip()

        # ── Step 1: Sarcasm check (dedicated model) ───────────────────────
        try:
            sarc_model, sarc_tokenizer = load_sarcasm_model()
            is_sarcastic, sarcasm_confidence = check_sarcasm(text, sarc_model, sarc_tokenizer)
        except Exception:
            is_sarcastic, sarcasm_confidence = False, 0.0

        # ── Step 2: Context flags ─────────────────────────────────────────
        has_negation, has_pain, has_burnout, pain_count = detect_context(text)

        # ── Step 3: Emotion model inference ──────────────────────────────
        model, tokenizer = load_text_model()
        with torch.no_grad():
            inputs = tokenizer(
                text, return_tensors="pt", padding=True,
                truncation=True, max_length=512
            )
            outputs = model(**inputs)
            # SamLowe uses sigmoid (multi-label), NOT softmax
            probabilities = torch.sigmoid(outputs.logits)[0]

        # ── Step 4: Map 28 labels → 5 core emotions ───────────────────────
        raw_probs = {
            model.config.id2label[i]: float(probabilities[i].item())
            for i in range(len(probabilities))
        }
        core_scores = aggregate_go_emotions(raw_probs)

        # ── Step 5: Context-aware adjustments ─────────────────────────────

        # 5a. Sarcasm: if sarcasm detected and model says joy → flip to sadness
        if is_sarcastic and core_scores['joy'] > 0.35:
            flip = core_scores['joy'] * 0.6
            core_scores['joy'] -= flip
            core_scores['sadness'] += flip * 0.7
            core_scores['anger'] += flip * 0.3
            total = sum(core_scores.values())
            core_scores = {k: v / total for k, v in core_scores.items()}

        # 5b. Pain signals: if model says joy but strong pain words present
        if has_pain and core_scores['joy'] > 0.4:
            penalty = min(0.45, 0.08 * pain_count)
            core_scores['joy'] = max(0.05, core_scores['joy'] - penalty)
            core_scores['sadness'] += penalty * 0.8
            core_scores['anxiety'] += penalty * 0.2
            total = sum(core_scores.values())
            core_scores = {k: v / total for k, v in core_scores.items()}

        # 5c. Burnout: "tired but not able to work" → boost anger (frustration)
        # Model maps this to anxiety/fear — this correction fixes that
        if has_burnout and has_negation:
            # Reduce anxiety, boost anger (frustration)
            shift = min(0.3, core_scores.get('anxiety', 0) * 0.5 + 0.1)
            core_scores['anger'] = min(1.0, core_scores['anger'] + shift)
            core_scores['anxiety'] = max(0.0, core_scores['anxiety'] - shift * 0.5)
            core_scores['neutral'] = max(0.0, core_scores['neutral'] - shift * 0.5)
            total = sum(core_scores.values())
            core_scores = {k: v / total for k, v in core_scores.items()}

        # 5d. Negation + joy: "I'm not happy", "I don't feel good"
        if has_negation and core_scores['joy'] > 0.5:
            shift = core_scores['joy'] * 0.4
            core_scores['joy'] -= shift
            core_scores['sadness'] += shift
            total = sum(core_scores.values())
            core_scores = {k: v / total for k, v in core_scores.items()}

        # ── Step 6: Primary emotion ────────────────────────────────────────
        primary_emotion = max(core_scores, key=core_scores.get)
        raw_confidence = core_scores[primary_emotion]

        # ── Step 7: Confidence calibration ────────────────────────────────
        calibrated_confidence = 0.5 + (raw_confidence - 0.5) * 0.7
        calibrated_confidence = round(min(0.88, max(0.45, calibrated_confidence)), 3)

        if is_sarcastic or has_pain or has_burnout:
            calibrated_confidence = min(calibrated_confidence, 0.75)

        # ── Step 8: Wellness score (polarity-aware, no cross-polarity blend) ─
        wellness_score = float(WELLNESS_SCORES.get(primary_emotion, 5.0))

        sorted_emotions = sorted(core_scores.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_emotions) >= 2:
            second_emotion, second_score = sorted_emotions[1]
            same_polarity = (
                (primary_emotion in NEGATIVE_EMOTIONS and second_emotion in NEGATIVE_EMOTIONS) or
                (primary_emotion in POSITIVE_EMOTIONS and second_emotion in POSITIVE_EMOTIONS)
            )
            if same_polarity and second_score > 0.15:
                second_wellness = WELLNESS_SCORES.get(second_emotion, 5.0)
                wellness_score = round(0.7 * wellness_score + 0.3 * second_wellness, 2)

        # ── Step 9: Interpretation ────────────────────────────────────────
        if is_sarcastic:
            context_note = "Irony or sarcasm detected in your message. "
        elif has_burnout and has_negation:
            context_note = "Signs of frustration or burnout detected. "
        elif has_pain:
            context_note = "Distress signals detected in your language. "
        elif has_negation:
            context_note = "Negation context considered. "
        else:
            context_note = ""

        if wellness_score >= 7:
            mood_note = "You seem to be in a positive emotional state."
        elif wellness_score >= 5:
            mood_note = "Your emotional state appears balanced."
        elif wellness_score >= 3.5:
            mood_note = "You may be experiencing some emotional difficulty."
        else:
            mood_note = "This seems like a difficult time — support is available."

        interpretation = f"{context_note}Detected emotion: {primary_emotion}. {mood_note}"
        crisis_detected = bool(wellness_score <= 3.0)

        response_data = {
            "emotion": {
                "primary": str(primary_emotion),
                "confidence": float(calibrated_confidence),
                "all_probabilities": {str(k): float(v) for k, v in core_scores.items()}
            },
            "wellness_score": float(wellness_score),
            "interpretation": str(interpretation),
            "crisis_indicators": {
                "crisis_detected": crisis_detected,
                "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
            },
            "modality": "text",
            "negation_detected": bool(has_negation),
            "context_flags": {
                "pain_signals": bool(has_pain),
                "sarcasm_detected": bool(is_sarcastic),
                "sarcasm_confidence": round(float(sarcasm_confidence), 3),
                "pain_signal_count": int(pain_count),
                "burnout_detected": bool(has_burnout),
            }
        }

        del inputs, outputs, probabilities
        gc.collect()

        logger.info(
            f"✅ Text: {primary_emotion} ({calibrated_confidence:.1%}) "
            f"| sarcasm={is_sarcastic}({sarcasm_confidence:.2f}) "
            f"pain={has_pain} burnout={has_burnout} negation={has_negation}"
        )

        return {
            "status": "success",
            "data": response_data,
            "processing_time": round(float(time.time() - start_time), 3)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Text error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AUDIO ANALYSIS
# ============================================================================

@app.post("/api/v1/analyze-audio", response_model=AudioAnalysisResponse)
async def analyze_audio(audio_file: UploadFile = File(...), user_id: str = "user123"):
    import time
    import librosa
    import tempfile
    from pydub import AudioSegment

    start_time = time.time()

    emotion_names_map = {
        1: 'neutral', 2: 'calm', 3: 'happy', 4: 'sad',
        5: 'angry', 6: 'fearful', 7: 'disgust', 8: 'surprised'
    }

    try:
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.ogg')):
            raise HTTPException(status_code=400, detail="Invalid audio format")

        audio_bytes = await audio_file.read()
        file_ext = os.path.splitext(audio_file.filename)[1].lower().replace('.', '')

        logger.info(f"📁 Received: {audio_file.filename} ({len(audio_bytes)} bytes)")

        # ── Try direct librosa load first (fastest path, no subprocess) ──────
        # pydub/ffmpeg adds 2-4s of subprocess overhead — avoid if possible
        audio_data = None
        sample_rate = 16000

        try:
            import soundfile as sf
            import io as _io
            audio_data, sr = sf.read(_io.BytesIO(audio_bytes))
            if audio_data.ndim > 1:
                audio_data = audio_data.mean(axis=1)   # stereo → mono
            if sr != 16000:
                import resampy
                audio_data = resampy.resample(audio_data, sr, 16000)
            audio_data = audio_data.astype(np.float32)
            logger.info(f"✅ Direct soundfile load succeeded ({len(audio_data)} samples)")
        except Exception as sf_err:
            logger.info(f"soundfile failed ({sf_err}), falling back to pydub")
            audio_data = None

        if audio_data is None:
            # Fallback: pydub conversion (handles m4a/aac/ogg via ffmpeg)
            try:
                audio_segment = AudioSegment.from_file(
                    io.BytesIO(audio_bytes),
                    format=file_ext if file_ext != 'wav' else None
                )
                audio_segment = audio_segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                wav_io = io.BytesIO()
                audio_segment.export(wav_io, format='wav')

                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                    temp_file.write(wav_io.getvalue())
                    temp_path = temp_file.name

                try:
                    # Reduced from 10s → 6s: sufficient for MFCC emotion, 40% faster
                    audio_data, sample_rate = librosa.load(temp_path, sr=16000, mono=True, duration=6)
                finally:
                    try:
                        os.unlink(temp_path)
                    except:
                        pass

            except Exception as e:
                logger.error(f"❌ Conversion error: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Could not process audio: {str(e)}")

        if len(audio_data) < sample_rate * 0.5:
            raise HTTPException(status_code=400, detail="Audio too short")

        mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=40)
        if mfccs.shape[1] < 174:
            mfccs = np.pad(mfccs, ((0, 0), (0, 174 - mfccs.shape[1])), mode='constant')
        else:
            mfccs = mfccs[:, :174]

        features = mfccs.reshape(1, 40, 174, 1)

        model, label_encoder = load_audio_model()
        predictions = model.predict(features, verbose=0)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class])

        emotion_code = int(label_encoder.inverse_transform([predicted_class])[0])
        primary_emotion = emotion_names_map.get(emotion_code, 'neutral')

        all_probabilities = {}
        for i in range(len(predictions[0])):
            code = int(label_encoder.inverse_transform([i])[0])
            name = emotion_names_map.get(code, f'emotion_{code}')
            all_probabilities[name] = float(predictions[0][i])

        # wellness_map = {
        #     'neutral': 5.0, 'calm': 6.0, 'happy': 8.5,
        #     'sad': 3.0, 'angry': 2.5, 'fearful': 3.5,
        #     'disgust': 3.0, 'surprised': 6.0
        # }
        # wellness_score = float(wellness_map.get(primary_emotion, 5.0))

        # interpretation = f"Voice analysis indicates {primary_emotion} emotion. "
        # if wellness_score >= 7:
        #     interpretation += "Positive emotions detected!"
        # elif wellness_score >= 4:
        #     interpretation += "Balanced emotional state."
        # else:
        #     interpretation += "Consider reaching out for support."

        # crisis_detected = bool(wellness_score < 3.0)

        AUDIO_WELLNESS = {
            'happy':     8.5,
            'calm':      6.5,
            'surprised': 5.5,
            'neutral':   5.0,
            'sad':       2.5,
            'fearful':   2.5,
            'angry':     2.0,
            'disgust':   2.0,
        }

        AUDIO_NEGATIVE = {'sad', 'fearful', 'angry', 'disgust'}
        AUDIO_POSITIVE = {'happy'}

        wellness_score = float(AUDIO_WELLNESS.get(primary_emotion, 5.0))

        # Polarity-aware blending — never let joy inflate a sad/fearful score
        audio_sorted = sorted(all_probabilities.items(), key=lambda x: x[1], reverse=True)
        if len(audio_sorted) >= 2:
            second_emotion, second_score = audio_sorted[1]
            same_polarity = (
                (primary_emotion in AUDIO_NEGATIVE and second_emotion in AUDIO_NEGATIVE) or
                (primary_emotion in AUDIO_POSITIVE and second_emotion in AUDIO_POSITIVE)
            )
            if same_polarity and second_score > 0.15:
                second_wellness = AUDIO_WELLNESS.get(second_emotion, 5.0)
                wellness_score = round(0.7 * wellness_score + 0.3 * second_wellness, 2)

        interpretation = f"Voice analysis indicates {primary_emotion} emotion. "
        if wellness_score >= 7:
            interpretation += "Positive emotions detected in your voice."
        elif wellness_score >= 5:
            interpretation += "Balanced emotional state detected."
        elif wellness_score >= 3.5:
            interpretation += "Your voice suggests some emotional difficulty."
        else:
            interpretation += "This seems like a difficult time — support is available."

        crisis_detected = bool(wellness_score <= 3.0)

        response_data = {
            "emotion": {
                "primary": str(primary_emotion),
                "confidence": float(confidence),
                "all_probabilities": {str(k): float(v) for k, v in all_probabilities.items()}
            },
            "wellness_score": float(wellness_score),
            "interpretation": str(interpretation),
            "crisis_indicators": {
                "crisis_detected": crisis_detected,
                "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
            },
            "modality": "audio",
            "audio_duration": float(len(audio_data) / sample_rate)
        }

        gc.collect()
        logger.info(f"✅ Audio: {primary_emotion} ({confidence:.1%}) in {time.time()-start_time:.2f}s")

        return {
            "status": "success",
            "data": response_data,
            "processing_time": round(float(time.time() - start_time), 3)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Audio error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# VIDEO ANALYSIS
# ============================================================================

@app.post("/api/v1/analyze-video", response_model=VideoAnalysisResponse)
async def analyze_video(image_file: UploadFile = File(...), user_id: str = "user123"):
    import time
    import cv2

    start_time = time.time()

    try:
        # Validate file
        if not image_file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="Please upload JPG or PNG image")

        image_bytes = await image_file.read()
        logger.info(f"📁 Received image: {image_file.filename} ({len(image_bytes)} bytes)")

        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Face detection using OpenCV Haar Cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            logger.warning("⚠️ No face detected in image")
            return {
                "status": "no_face",
                "data": {
                    "emotion": {"primary": "unknown", "confidence": 0.0, "all_probabilities": {}},
                    "wellness_score": 5.0,
                    "interpretation": "No face detected. Please ensure your face is clearly visible.",
                    "crisis_indicators": {"crisis_detected": False, "recommendation": "Try again with better lighting"},
                    "modality": "video",
                    "faces_detected": 0
                },
                "processing_time": round(float(time.time() - start_time), 3)
            }

        logger.info(f"✅ {len(faces)} face(s) detected")

        # Process first/largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

        # Extract and preprocess face
        face_roi = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face_roi, (48, 48))
        face_normalized = face_resized / 255.0
        face_input = face_normalized.reshape(1, 48, 48, 1)

        # Predict emotion
        model, class_indices = load_video_model()
        predictions = model.predict(face_input, verbose=0)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class])

        # Get emotion name
        primary_emotion = str(class_indices.get(predicted_class, 'neutral'))

        logger.info(f"✅ Video emotion: {primary_emotion} ({confidence:.1%})")

        # All probabilities
        all_probabilities = {
            str(class_indices.get(i, f'emotion_{i}')): float(predictions[0][i])
            for i in range(len(predictions[0]))
        }

        # # Wellness score
        # wellness_map = {
        #     'happy': 8.5, 'surprise': 6.5, 'neutral': 5.0,
        #     'sad': 3.0, 'fear': 3.5, 'angry': 2.5,
        #     'disgust': 3.0
        # }
        # wellness_score = float(wellness_map.get(primary_emotion, 5.0))

        # interpretation = f"Facial expression indicates {primary_emotion} emotion. "
        # if wellness_score >= 7:
        #     interpretation += "You appear to be in a positive emotional state!"
        # elif wellness_score >= 4:
        #     interpretation += "Your expression shows a balanced emotional state."
        # else:
        #     interpretation += "Your expression suggests you might benefit from support."

        # crisis_detected = bool(wellness_score < 3.0)

        # ── Wellness score (polarity-aware, matches text endpoint) ─────────
        VIDEO_WELLNESS = {
            'happy':   8.5,
            'surprise': 5.5,
            'neutral': 5.0,
            'sad':     2.5,
            'fear':    2.5,
            'angry':   2.0,
            'disgust': 2.0,
        }

        VIDEO_NEGATIVE = {'sad', 'fear', 'angry', 'disgust'}
        VIDEO_POSITIVE = {'happy'}

        wellness_score = float(VIDEO_WELLNESS.get(primary_emotion, 5.0))

        # Polarity-aware blending — never let happy inflate a sad/fear score
        video_sorted = sorted(
            [(str(class_indices.get(i, f'class_{i}')), float(predictions[0][i]))
             for i in range(len(predictions[0]))],
            key=lambda x: x[1], reverse=True
        )
        if len(video_sorted) >= 2:
            second_emotion, second_score = video_sorted[1]
            same_polarity = (
                (primary_emotion in VIDEO_NEGATIVE and second_emotion in VIDEO_NEGATIVE) or
                (primary_emotion in VIDEO_POSITIVE and second_emotion in VIDEO_POSITIVE)
            )
            if same_polarity and second_score > 0.15:
                second_wellness = VIDEO_WELLNESS.get(second_emotion, 5.0)
                wellness_score = round(0.7 * wellness_score + 0.3 * second_wellness, 2)

        interpretation = f"Facial expression indicates {primary_emotion} emotion. "
        if wellness_score >= 7:
            interpretation += "You appear to be in a positive emotional state."
        elif wellness_score >= 5:
            interpretation += "Your expression shows a balanced emotional state."
        elif wellness_score >= 3.5:
            interpretation += "Your expression suggests some emotional difficulty."
        else:
            interpretation += "This seems like a difficult time — support is available."

        crisis_detected = bool(wellness_score <= 3.0)


        response_data = {
            "emotion": {
                "primary": str(primary_emotion),
                "confidence": float(confidence),
                "all_probabilities": {str(k): float(v) for k, v in all_probabilities.items()}
            },
            "wellness_score": float(wellness_score),
            "interpretation": str(interpretation),
            "crisis_indicators": {
                "crisis_detected": crisis_detected,
                "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
            },
            "modality": "video",
            "faces_detected": int(len(faces))
        }

        gc.collect()

        return {
            "status": "success",
            "data": response_data,
            "processing_time": round(float(time.time() - start_time), 3)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Video error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# NEW ENDPOINT TO ADD TO app.py - VIDEO UPLOAD ANALYSIS

# Add this after the existing analyze-video endpoint (around line 500)

@app.post("/api/v1/analyze-video-upload")
async def analyze_video_upload(video_file: UploadFile = File(...), user_id: str = "user123"):
    """
    Analyze video by extracting frames server-side and analyzing each frame
    Returns emotion timeline with results at 0s, 3s, 6s, 9s
    """
    import time
    import cv2
    import tempfile
    
    start_time = time.time()
    
    emotion_names_map = {
        1: 'neutral', 2: 'calm', 3: 'happy', 4: 'sad',
        5: 'angry', 6: 'fearful', 7: 'disgust', 8: 'surprised'
    }
    
    try:
        # Validate file type
        if not video_file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.m4v')):
            raise HTTPException(status_code=400, detail="Invalid video format. Use MP4, MOV, AVI, or M4V")
        
        video_bytes = await video_file.read()
        logger.info(f"📹 Received video: {video_file.filename} ({len(video_bytes)} bytes)")
        
        # Save video temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            temp_video.write(video_bytes)
            temp_video_path = temp_video.name
        
        try:
            # Open video with OpenCV
            cap = cv2.VideoCapture(temp_video_path)
            
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open video file")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps if fps > 0 else 0
            
            logger.info(f"📹 Video info: {duration:.1f}s, {fps:.1f} fps, {total_frames} frames")
            
            # Extract frames at 0s, 3s, 6s, 9s
            frame_times = [0, 3, 6, 9]  # seconds
            frame_results = []
            
            for time_sec in frame_times:
                if time_sec > duration:
                    continue  # Skip if video is shorter
                
                # Seek to frame
                frame_number = int(time_sec * fps)
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
                
                ret, frame = cap.read()
                if not ret:
                    logger.warning(f"⚠️ Could not read frame at {time_sec}s")
                    continue
                
                logger.info(f"✅ Extracted frame at {time_sec}s")
                
                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Detect face
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
                
                if len(faces) == 0:
                    logger.warning(f"⚠️ No face at {time_sec}s")
                    continue
                
                # Get largest face
                x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
                
                # Extract face ROI
                face_roi = gray[y:y+h, x:x+w]
                face_resized = cv2.resize(face_roi, (48, 48))
                face_normalized = face_resized / 255.0
                face_input = face_normalized.reshape(1, 48, 48, 1)
                
                # Predict emotion
                model, class_indices = load_video_model()
                predictions = model.predict(face_input, verbose=0)
                predicted_class = int(np.argmax(predictions[0]))
                confidence = float(predictions[0][predicted_class])
                
                # Get emotion name
                primary_emotion = str(class_indices.get(predicted_class, 'neutral'))
                
                logger.info(f"✅ Frame {time_sec}s: {primary_emotion} ({confidence:.1%})")
                
                # Store result
                frame_results.append({
                    'time': float(time_sec),
                    'emotion': primary_emotion,
                    'confidence': float(confidence),
                    'faces_detected': int(len(faces))
                })
            
            cap.release()
            
            # Check if we got any results
            if len(frame_results) == 0:
                return {
                    "status": "no_face",
                    "message": "No faces detected in video. Please ensure your face is visible.",
                    "processing_time": round(float(time.time() - start_time), 3)
                }
            
            # Calculate overall statistics
            emotion_counts = {}
            total_confidence = 0
            
            for result in frame_results:
                emotion = result['emotion']
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                total_confidence += result['confidence']
            
            # Dominant emotion (most frequent)
            dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
            avg_confidence = total_confidence / len(frame_results)
            
            # Wellness score for dominant emotion
            wellness_map = {
                'happy': 8.5, 'surprise': 6.5, 'neutral': 5.0,
                'sad': 3.0, 'fear': 3.5, 'angry': 2.5,
                'disgust': 3.0, 'calm': 6.0
            }
            wellness_score = float(wellness_map.get(dominant_emotion, 5.0))
            
            interpretation = f"Video analysis shows {dominant_emotion} as the dominant emotion across {len(frame_results)} frames. "
            if wellness_score >= 7:
                interpretation += "Overall positive emotional state detected."
            elif wellness_score >= 4:
                interpretation += "Balanced emotional state observed."
            else:
                interpretation += "Consider reaching out for support."
            
            crisis_detected = bool(wellness_score < 3.0)
            
            response_data = {
                "emotion": {
                    "primary": str(dominant_emotion),
                    "confidence": float(avg_confidence),
                    "emotion_distribution": {str(k): int(v) for k, v in emotion_counts.items()}
                },
                "wellness_score": float(wellness_score),
                "interpretation": str(interpretation),
                "crisis_indicators": {
                    "crisis_detected": crisis_detected,
                    "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
                },
                "modality": "video",
                "video_duration": float(duration),
                "frames_analyzed": int(len(frame_results)),
                "frame_timeline": frame_results
            }
            
            processing_time = float(time.time() - start_time)
            logger.info(f"✅ Video analysis complete: {len(frame_results)} frames in {processing_time:.1f}s")
            
            gc.collect()
            
            return {
                "status": "success",
                "data": response_data,
                "processing_time": round(processing_time, 3)
            }
            
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_video_path)
            except:
                pass
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Video analysis error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# ADD THIS TO app.py - MULTIMODAL FUSION ENDPOINT
# Copy this entire code and paste it BEFORE the if __name__ == "__main__": line

from typing import Optional
from fastapi import Form

@app.post("/api/v1/analyze-multimodal")
async def analyze_multimodal(
    text: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    user_id: str = "user123"
):
    import torch
    import time
    start_time = time.time()

    results = {
        "text_result": None,
        "audio_result": None,
        "video_result": None
    }
    modalities_used = []

    # ── Wellness config (same as standalone text endpoint) ────────────────────
    WELLNESS_SCORES = {
        'joy': 8.5, 'happy': 8.5,
        'neutral': 5.0, 'calm': 5.0, 'surprise': 5.5,
        'sadness': 2.5, 'sad': 2.5,
        'anxiety': 2.5, 'fearful': 2.5, 'fear': 2.5,
        'anger': 2.0, 'angry': 2.0,
        'disgust': 2.0,
    }

    NEGATIVE_EMOTIONS = {'sadness', 'sad', 'anxiety', 'fearful', 'fear', 'anger', 'angry', 'disgust'}
    POSITIVE_EMOTIONS = {'joy', 'happy'}

    try:

        # ====================================================================
        # TEXT — reuse exact same logic as /analyze-text endpoint
        # ====================================================================
        if text and len(text.strip()) > 0:
            try:
                logger.info(f"📝 Multimodal text: {text[:50]}...")

                # ── Sarcasm check ────────────────────────────────────────────
                try:
                    sarc_model, sarc_tokenizer = load_sarcasm_model()
                    is_sarcastic, sarcasm_confidence = check_sarcasm(
                        text, sarc_model, sarc_tokenizer
                    )
                except Exception:
                    is_sarcastic, sarcasm_confidence = False, 0.0

                # ── Context flags ────────────────────────────────────────────
                has_negation, has_pain, has_burnout, pain_count = detect_context(text)

                # ── Emotion model (SamLowe go_emotions) ──────────────────────
                model, tokenizer = load_text_model()
                with torch.no_grad():
                    inputs = tokenizer(
                        text, return_tensors="pt", padding=True,
                        truncation=True, max_length=512
                    )
                    outputs = model(**inputs)
                    # SamLowe uses sigmoid (multi-label)
                    probabilities = torch.sigmoid(outputs.logits)[0]

                raw_probs = {
                    model.config.id2label[i]: float(probabilities[i].item())
                    for i in range(len(probabilities))
                }
                core_scores = aggregate_go_emotions(raw_probs)

                # ── Context adjustments (identical to /analyze-text) ──────────
                if is_sarcastic and core_scores['joy'] > 0.35:
                    flip = core_scores['joy'] * 0.6
                    core_scores['joy'] -= flip
                    core_scores['sadness'] += flip * 0.7
                    core_scores['anger'] += flip * 0.3
                    total = sum(core_scores.values())
                    core_scores = {k: v / total for k, v in core_scores.items()}

                if has_pain and core_scores['joy'] > 0.4:
                    penalty = min(0.45, 0.08 * pain_count)
                    core_scores['joy'] = max(0.05, core_scores['joy'] - penalty)
                    core_scores['sadness'] += penalty * 0.8
                    core_scores['anxiety'] += penalty * 0.2
                    total = sum(core_scores.values())
                    core_scores = {k: v / total for k, v in core_scores.items()}

                if has_burnout and has_negation:
                    shift = min(0.3, core_scores.get('anxiety', 0) * 0.5 + 0.1)
                    core_scores['anger'] = min(1.0, core_scores['anger'] + shift)
                    core_scores['anxiety'] = max(0.0, core_scores['anxiety'] - shift * 0.5)
                    core_scores['neutral'] = max(0.0, core_scores['neutral'] - shift * 0.5)
                    total = sum(core_scores.values())
                    core_scores = {k: v / total for k, v in core_scores.items()}

                if has_negation and core_scores['joy'] > 0.5:
                    shift = core_scores['joy'] * 0.4
                    core_scores['joy'] -= shift
                    core_scores['sadness'] += shift
                    total = sum(core_scores.values())
                    core_scores = {k: v / total for k, v in core_scores.items()}

                text_primary = max(core_scores, key=core_scores.get)
                text_confidence = core_scores[text_primary]

                # Calibrate confidence
                text_confidence = 0.5 + (text_confidence - 0.5) * 0.7
                text_confidence = round(min(0.88, max(0.45, text_confidence)), 3)
                if is_sarcastic or has_pain or has_burnout:
                    text_confidence = min(text_confidence, 0.75)

                results["text_result"] = {
                    "emotion": text_primary,
                    "confidence": float(text_confidence),
                    "all_probabilities": {str(k): float(v) for k, v in core_scores.items()}
                }
                modalities_used.append("text")
                logger.info(f"✅ Text: {text_primary} ({text_confidence:.2%})")

                del inputs, outputs, probabilities
                gc.collect()

            except Exception as e:
                logger.error(f"❌ Multimodal text failed: {e}")

        # ====================================================================
        # AUDIO — unchanged from your original
        # ====================================================================
        if audio_file:
            try:
                logger.info(f"🎤 Analyzing audio: {audio_file.filename}")
                audio_bytes = await audio_file.read()
                model, label_encoder = load_audio_model()

                import librosa
                from pydub import AudioSegment

                audio_buffer = io.BytesIO(audio_bytes)
                if audio_file.filename.lower().endswith(('.m4a', '.mp3', '.ogg')):
                    audio_segment = AudioSegment.from_file(audio_buffer)
                    wav_buffer = io.BytesIO()
                    audio_segment.export(wav_buffer, format='wav')
                    wav_buffer.seek(0)
                    audio_buffer = wav_buffer

                y, sr = librosa.load(audio_buffer, sr=22050, duration=15)
                mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
                target_length = 174
                if mfccs.shape[1] < target_length:
                    mfccs = np.pad(mfccs, ((0, 0), (0, target_length - mfccs.shape[1])), mode='constant')
                else:
                    mfccs = mfccs[:, :target_length]
                mfccs_input = mfccs.reshape(1, 40, target_length, 1)

                predictions = model.predict(mfccs_input, verbose=0)
                predicted_class = np.argmax(predictions[0])
                confidence = float(predictions[0][predicted_class])

                emotion_map = {
                    0: 'neutral', 1: 'calm', 2: 'happy', 3: 'sad',
                    4: 'angry', 5: 'fearful', 6: 'disgust', 7: 'surprised'
                }
                primary_emotion = emotion_map.get(predicted_class, 'neutral')
                all_probs = {emotion_map[i]: float(predictions[0][i]) for i in range(8)}

                results["audio_result"] = {
                    "emotion": primary_emotion,
                    "confidence": float(confidence),
                    "all_probabilities": all_probs
                }
                modalities_used.append("audio")
                logger.info(f"✅ Audio: {primary_emotion} ({confidence:.2%})")

            except Exception as e:
                logger.error(f"❌ Audio analysis failed: {e}")

        # ====================================================================
        # IMAGE — unchanged from your original
        # ====================================================================
        if image_file:
            try:
                logger.info(f"📸 Analyzing image: {image_file.filename}")
                import cv2

                image_bytes = await image_file.read()
                image_array = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

                face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                faces = face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )

                if len(faces) > 0:
                    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
                    face_roi = gray[y:y+h, x:x+w]
                    face_resized = cv2.resize(face_roi, (48, 48))
                    face_normalized = face_resized / 255.0
                    face_input = face_normalized.reshape(1, 48, 48, 1)

                    model, class_indices = load_video_model()
                    predictions = model.predict(face_input, verbose=0)
                    predicted_class = int(np.argmax(predictions[0]))
                    confidence = float(predictions[0][predicted_class])
                    primary_emotion = str(class_indices.get(predicted_class, 'neutral'))
                    all_probs = {
                        str(class_indices.get(i, f'class_{i}')): float(predictions[0][i])
                        for i in range(len(predictions[0]))
                    }

                    results["video_result"] = {
                        "emotion": primary_emotion,
                        "confidence": float(confidence),
                        "all_probabilities": all_probs
                    }
                    modalities_used.append("video")
                    logger.info(f"✅ Image: {primary_emotion} ({confidence:.2%})")
                else:
                    logger.warning("⚠️ No face detected in image")

            except Exception as e:
                logger.error(f"❌ Image analysis failed: {e}")

        # ====================================================================
        # VALIDATE
        # ====================================================================
        if len(modalities_used) == 0:
            raise HTTPException(
                status_code=400,
                detail="No valid input could be analyzed. Please provide text, audio, or image."
            )

        # ====================================================================
        # FUSION — weighted ensemble
        # ====================================================================
        weights = {"text": 0.4, "audio": 0.3, "video": 0.3}
        available_weights = {k: v for k, v in weights.items() if k in modalities_used}
        total_weight = sum(available_weights.values())
        normalized_weights = {k: v / total_weight for k, v in available_weights.items()}

        logger.info(f"🔀 Fusing {modalities_used} with weights: {normalized_weights}")

        # Map all emotions to common 7-emotion set
        emotion_mapping = {
            'joy': 'happy', 'sadness': 'sad', 'anger': 'angry',
            'anxiety': 'fearful', 'neutral': 'neutral', 'calm': 'neutral',
            'happy': 'happy', 'sad': 'sad', 'angry': 'angry',
            'fearful': 'fearful', 'fear': 'fearful', 'disgust': 'disgust',
            'surprised': 'surprise', 'surprise': 'surprise',
        }

        common_emotions = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'disgust', 'surprise']
        fused_probs = {e: 0.0 for e in common_emotions}

        for modality in modalities_used:
            result_key = f"{modality}_result"
            modality_probs = results[result_key]["all_probabilities"]
            weight = normalized_weights[modality]
            for orig_emotion, prob in modality_probs.items():
                mapped = emotion_mapping.get(orig_emotion, orig_emotion)
                if mapped in fused_probs:
                    fused_probs[mapped] += prob * weight

        final_emotion = max(fused_probs, key=fused_probs.get)
        final_confidence = fused_probs[final_emotion]

        logger.info(f"✅ Fused: {final_emotion} ({final_confidence:.2%})")

        # ====================================================================
        # WELLNESS SCORE — polarity-aware blending (same logic as text endpoint)
        # ====================================================================
        wellness_score = float(WELLNESS_SCORES.get(final_emotion, 5.0))

        sorted_fused = sorted(fused_probs.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_fused) >= 2:
            second_emotion, second_score = sorted_fused[1]
            same_polarity = (
                (final_emotion in NEGATIVE_EMOTIONS and second_emotion in NEGATIVE_EMOTIONS) or
                (final_emotion in POSITIVE_EMOTIONS and second_emotion in POSITIVE_EMOTIONS)
            )
            if same_polarity and second_score > 0.15:
                second_wellness = WELLNESS_SCORES.get(second_emotion, 5.0)
                wellness_score = round(0.7 * wellness_score + 0.3 * second_wellness, 2)

        # ====================================================================
        # INTERPRETATION
        # ====================================================================
        modality_str = ", ".join(modalities_used)
        if wellness_score >= 7:
            mood_note = "Overall positive emotional state."
        elif wellness_score >= 5:
            mood_note = "Balanced emotional state."
        elif wellness_score >= 3.5:
            mood_note = "You may be experiencing some emotional difficulty."
        else:
            mood_note = "This seems like a difficult time — support is available."

        interpretation = (
            f"Multimodal analysis using {modality_str} detected {final_emotion}. {mood_note}"
        )

        crisis_detected = bool(wellness_score <= 3.0)

        response_data = {
            "emotion": {
                "primary": final_emotion,
                "confidence": float(final_confidence),
                "all_probabilities": {k: float(v) for k, v in fused_probs.items()}
            },
            "wellness_score": float(wellness_score),
            "interpretation": interpretation,
            "crisis_indicators": {
                "crisis_detected": crisis_detected,
                "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
            },
            "modality": "multimodal",
            "modalities_used": modalities_used,
            "fusion_weights": normalized_weights,
            "individual_results": {
                k.replace("_result", ""): v
                for k, v in results.items()
                if v is not None
            }
        }

        gc.collect()
        logger.info(
            f"✅ Multimodal done in {time.time() - start_time:.2f}s | "
            f"{final_emotion} | wellness={wellness_score}"
        )

        return {
            "status": "success",
            "data": response_data,
            "processing_time": round(float(time.time() - start_time), 3)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Multimodal error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
        
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)