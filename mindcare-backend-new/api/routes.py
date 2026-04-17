from fastapi import APIRouter
from pydantic import BaseModel
from models.model_loader import get_text_model
import time

router = APIRouter()

class TextInput(BaseModel):
    text: str
    user_id: str = None

@router.post("/analyze-text")
async def analyze_text(input_data: TextInput):
    start = time.time()
    model = get_text_model()
    result = model.analyze(input_data.text)
    return {"success": True, "data": result, "processing_time": time.time() - start}

@router.get("/health")
async def health():
    try:
        model = get_text_model()
        return {"status": "healthy", "model_loaded": True, "model": model.model_name}
    except:
        return {"status": "unhealthy", "model_loaded": False}