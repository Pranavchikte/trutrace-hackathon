from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from api_clients import detect_ai_image, detect_ai_text
from watermark import apply_bharat_mark
from blockchain import init_blockchain, add_to_blockchain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_blockchain()

@app.post("/detect-image")
async def detect_image(file: UploadFile = File(...)):
    upload_path = f"uploads/{file.filename}"
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    result = detect_ai_image(upload_path)
    
    if result['status'] == 'success':
        status = "AI_DETECTED" if result['is_ai_generated'] else "HUMAN_CREATED"
        blockchain_hash = add_to_blockchain("image", status)
        
        if result['is_ai_generated']:
            # AI detected - return watermarked image
            watermarked_image = apply_bharat_mark(upload_path)
            
            return StreamingResponse(
                watermarked_image,
                media_type="image/png",
                headers={
                    "X-AI-Detection": "true",
                    "X-Confidence": str(result['confidence']),
                    "X-Blockchain-Hash": blockchain_hash
                }
            )
        else:
            # Human created - return JSON with headers
            return JSONResponse(
                {
                    "is_ai_generated": False,
                    "confidence": result['confidence'],
                    "blockchain_hash": blockchain_hash
                },
                headers={
                    "X-AI-Detection": "false",
                    "X-Confidence": str(result['confidence']),
                    "X-Blockchain-Hash": blockchain_hash
                }
            )
    
    return JSONResponse({"error": "Detection failed"}, status_code=500)

@app.post("/detect-text")
async def detect_text(text: str = Form(...)):
    result = detect_ai_text(text)
    
    if result['status'] == 'success':
        status = "AI_DETECTED" if result['is_ai_generated'] else "HUMAN_CREATED"
        blockchain_hash = add_to_blockchain("text", status)
        
        return JSONResponse({
            "is_ai_generated": result['is_ai_generated'],
            "confidence": result['confidence'],
            "blockchain_hash": blockchain_hash
        })
    
    return JSONResponse({"error": result.get('message', 'Unknown error')}, status_code=500)

@app.get("/")
async def root():
    return {"message": "TruTrace API is running"}