# main.py - FINAL VERSION WITH PUBLIC MODEL
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import logging
import os
import gc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MindCare AI Backend",
    description="Emotion Analysis API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model and tokenizer (loaded once)
MODEL = None
TOKENIZER = None
MODEL_LOADED = False

def load_model_once():
    """Load model only once to save memory"""
    global MODEL, TOKENIZER, MODEL_LOADED
    
    if MODEL_LOADED:
        return MODEL, TOKENIZER
    
    try:
        logger.info("🔄 Loading emotion model...")
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        import torch
        
        # YOUR PUBLIC MODEL
        model_name = "Kruti1234/mindcare-text-emotion"
        
        logger.info(f"📥 Loading from: {model_name}")
        
        # Load tokenizer
        TOKENIZER = AutoTokenizer.from_pretrained(model_name)
        
        # Load model (simple loading for 512MB RAM)
        MODEL = AutoModelForSequenceClassification.from_pretrained(model_name)
        
        # Set to eval mode and disable gradients
        MODEL.eval()
        for param in MODEL.parameters():
            param.requires_grad = False
        
        MODEL_LOADED = True
        gc.collect()
        
        logger.info("✅ Model loaded successfully!")
        return MODEL, TOKENIZER
        
    except Exception as e:
        logger.error(f"❌ Model loading failed: {str(e)}")
        raise

# Request/Response models
class TextAnalysisRequest(BaseModel):
    text: str
    user_id: str = "user123"

class TextAnalysisResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    processing_time: float

@app.on_event("startup")
async def startup_event():
    """Pre-load model on startup"""
    try:
        logger.info("🚀 Starting MindCare AI Backend...")
        load_model_once()
        logger.info("✅ Backend ready!")
    except Exception as e:
        logger.error(f"⚠️ Startup error: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "MindCare AI Backend",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": MODEL_LOADED
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mindcare-backend",
        "model_loaded": MODEL_LOADED
    }

@app.post("/api/v1/analyze-text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """Analyze emotion from text"""
    import time
    import torch
    
    start_time = time.time()
    
    try:
        # Validate input
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 1000:
            raise HTTPException(status_code=400, detail="Text too long (max 1000 chars)")
        
        # Load model if not loaded
        model, tokenizer = load_model_once()
        
        logger.info(f"📝 Analyzing: '{request.text[:30]}...'")
        
        # Tokenize and analyze
        with torch.no_grad():
            inputs = tokenizer(
                request.text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=128
            )
            
            outputs = model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)[0]
            predicted_class = torch.argmax(probabilities).item()
            confidence = probabilities[predicted_class].item()
        
        # Emotion mapping (0-4 for 5 emotions)
        emotion_map = {
            0: "joy",
            1: "sadness", 
            2: "anger",
            3: "anxiety",
            4: "neutral"
        }
        
        primary_emotion = emotion_map.get(predicted_class, "neutral")
        
        # All probabilities
        all_probabilities = {
            emotion_map[i]: float(probabilities[i].item())
            for i in range(len(probabilities))
        }
        
        # Wellness score
        wellness_scores = {
            "joy": 8.5,
            "neutral": 5.0,
            "anxiety": 3.5,
            "sadness": 3.0,
            "anger": 2.5
        }
        wellness_score = wellness_scores.get(primary_emotion, 5.0)
        
        # Interpretation
        interpretation = f"Analysis indicates {primary_emotion} emotion. "
        if wellness_score >= 7:
            interpretation += "You're experiencing positive emotions!"
        elif wellness_score >= 4:
            interpretation += "Your emotional state is balanced."
        else:
            interpretation += "Consider reaching out for support."
        
        # Crisis detection
        crisis_detected = wellness_score < 3.0
        
        processing_time = time.time() - start_time
        
        response_data = {
            "emotion": {
                "primary": primary_emotion,
                "confidence": float(confidence),
                "all_probabilities": all_probabilities
            },
            "wellness_score": float(wellness_score),
            "interpretation": interpretation,
            "crisis_indicators": {
                "crisis_detected": crisis_detected,
                "recommendation": "Seek professional support" if crisis_detected else "Continue monitoring"
            }
        }
        
        # Cleanup
        del inputs, outputs, probabilities
        gc.collect()
        
        logger.info(f"✅ Result: {primary_emotion} ({confidence:.1%}) in {processing_time:.2f}s")
        
        return {
            "status": "success",
            "data": response_data,
            "processing_time": round(processing_time, 3)
        }
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)