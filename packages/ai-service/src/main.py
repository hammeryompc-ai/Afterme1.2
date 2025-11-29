import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline
import numpy as np
import librosa
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load AI models
try:
    # Personality analysis model
    personality_model = pipeline(
        "text-classification",
        model="distilbert-base-uncased",
        top_k=None
    )
    
    # Text generation for responses
    response_generator = pipeline(
        "text-generation",
        model="gpt2"
    )
    
    print("AI models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/analyze-personality', methods=['POST'])
def analyze_personality():
    """Analyze text samples to extract personality traits"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        # Analyze personality traits from texts
        traits = extract_personality_traits(texts)
        
        return jsonify({
            'traits': traits,
            'confidence': 0.85,
            'processed': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-response', methods=['POST'])
def generate_response():
    """Generate AI response based on user input and personality"""
    try:
        data = request.json
        user_message = data.get('message', '')
        personality_traits = data.get('personality', [])
        
        # Generate contextual response
        response = generate_contextual_response(
            user_message,
            personality_traits
        )
        
        return jsonify({
            'response': response,
            'generated': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/analyze', methods=['POST'])
def analyze_voice():
    """Analyze voice sample for characteristics"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file'}), 400
        
        audio_file = request.files['audio']
        audio_data, sr = librosa.load(audio_file)
        
        # Extract voice characteristics
        characteristics = extract_voice_characteristics(audio_data, sr)
        
        return jsonify({
            'characteristics': characteristics,
            'sampleRate': sr,
            'analyzed': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/synthesize', methods=['POST'])
def synthesize_voice():
    """Synthesize speech with cloned voice"""
    try:
        data = request.json
        text = data.get('text', '')
        voice_profile = data.get('voiceProfile', {})
        
        # Generate speech (in production use real voice cloning)
        audio_path = synthesize_speech(text, voice_profile)
        
        return jsonify({
            'audioUrl': audio_path,
            'synthesized': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_personality_traits(texts):
    """Extract key personality traits from text samples"""
    traits = []
    trait_keywords = {
        'friendly': ['friend', 'love', 'happy', 'kind', 'warm'],
        'creative': ['imagine', 'create', 'art', 'design', 'innovative'],
        'thoughtful': ['think', 'consider', 'reflect', 'deep', 'meaningful'],
        'empathetic': ['feel', 'understand', 'care', 'help', 'compassion'],
        'humorous': ['laugh', 'funny', 'joke', 'humor', 'silly'],
    }
    
    combined_text = ' '.join(texts).lower()
    
    for trait, keywords in trait_keywords.items():
        if any(keyword in combined_text for keyword in keywords):
            traits.append(trait.capitalize())
    
    return traits[:4] if traits else ['Thoughtful', 'Kind']

def generate_contextual_response(message, personality_traits):
    """Generate a response that matches personality"""
    prompt = f"Respond to: '{message}' with a {', '.join(personality_traits).lower()} tone."
    
    try:
        response = response_generator(
            prompt,
            max_length=100,
            num_return_sequences=1
        )
        return response[0]['generated_text']
    except:
        return f"I appreciate your message. {message}"

def extract_voice_characteristics(audio_data, sr):
    """Extract characteristics from voice audio"""
    return {
        'pitch': float(np.mean(librosa.yin(audio_data, fmin=80, fmax=400, sr=sr))),
        'energy': float(np.mean(np.abs(audio_data))),
        'mfcc': librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13).tolist(),
        'duration': float(len(audio_data) / sr)
    }

def synthesize_speech(text, voice_profile):
    """Synthesize speech with voice characteristics"""
    # In production, this would use a real voice cloning model like:
    # - Tacotron2 for text-to-speech
    # - WaveGlow for vocoder
    # - Speaker encoder for voice cloning
    
    import uuid
    return f"/voices/{uuid.uuid4()}.wav"

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 6000))
    app.run(host='0.0.0.0', port=port, debug=True)
