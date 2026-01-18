import requests
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

SIGHTENGINE_USER = os.getenv("SIGHTENGINE_API_USER")
SIGHTENGINE_SECRET = os.getenv("SIGHTENGINE_API_SECRET")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

def detect_ai_image(image_path):
    url = "https://api.sightengine.com/1.0/check.json"
    
    files = {'media': open(image_path, 'rb')}
    data = {
        'models': 'genai',
        'api_user': SIGHTENGINE_USER,
        'api_secret': SIGHTENGINE_SECRET
    }
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    if 'type' in result and 'ai_generated' in result['type']:
        ai_prob = result['type']['ai_generated']
        is_ai = ai_prob > 0.5
        return {
            'is_ai_generated': is_ai,
            'confidence': ai_prob,
            'status': 'success'
        }
    
    return {'status': 'error', 'message': 'Detection failed'}

def detect_ai_text(text):
    try:
        # Chunk text if too long (every 3000 chars)
        chunks = [text[i:i+3000] for i in range(0, len(text), 3000)]
        
        total_ai_score = 0
        
        for chunk in chunks:
            prompt = f"""Analyze if the following text was written by AI or a human.

Rules:
1. AI-generated text often has: perfect grammar, repetitive patterns, generic phrasing, overly formal tone, lack of personal voice
2. Human text often has: minor errors, colloquialisms, inconsistent tone, personal anecdotes, unique voice

Text to analyze:
\"\"\"{chunk}\"\"\"

Respond with ONLY a number between 0 and 1, where:
- 0 = definitely human-written
- 1 = definitely AI-generated
- 0.5 = uncertain

Your answer (just the number):"""

            response = client.models.generate_content(
                model='gemini-3-flash-preview',
                contents=prompt
            )
            
            score_text = response.text.strip()
            
            # Extract number from response
            try:
                score = float(score_text)
                total_ai_score += score
            except:
                # If parsing fails, try to extract first number
                import re
                numbers = re.findall(r'0?\.\d+|[01]', score_text)
                if numbers:
                    total_ai_score += float(numbers[0])
                else:
                    total_ai_score += 0.5
        
        # Average across chunks
        avg_score = total_ai_score / len(chunks)
        is_ai = avg_score > 0.5
        
        return {
            'is_ai_generated': is_ai,
            'confidence': avg_score,
            'status': 'success'
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}