import requests

# Test with AI text
ai_text = """Artificial intelligence has revolutionized numerous industries by enabling machines to perform tasks that traditionally required human intelligence. Through machine learning algorithms and neural networks, AI systems can now analyze vast amounts of data, recognize patterns, and make predictions with remarkable accuracy."""

response = requests.post('http://127.0.0.1:8000/detect-text', data={'text': ai_text})
print(f"AI Text Result: {response.json()}\n")

# Test with human text
human_text = "yo bro wtf is happening lol this shit is crazy ngl gonna grab some food brb"

response = requests.post('http://127.0.0.1:8000/detect-text', data={'text': human_text})
print(f"Human Text Result: {response.json()}")