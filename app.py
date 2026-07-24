"""
AI Study Assistant - Main Flask Application
"""

import os
import markdown
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from utils.ai_helper import assistant

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')

# Validate API key at startup
if not os.getenv('GROQ_API_KEY'):
    print("⚠️  WARNING: GROQ_API_KEY not found in environment variables!")
    print("Please add your Groq API key to the .env file")

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    """
    API endpoint to process questions and return explanations
    """
    try:
        # Get data from request
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                'error': 'No question provided'
            }), 400
        
        question = data['question'].strip()
        personality = data.get('personality', 'friendly_tutor')
        
        # Validate input
        if not question:
            return jsonify({
                'error': 'Empty question provided'
            }), 400
        
        # Get explanation from AI
        result = assistant.get_explanation(question, personality)
        
        # Check for errors
        if 'error' in result:
            return jsonify({
                'error': result['error']
            }), 500
        
        # Convert markdown to HTML if needed
        # result['explanation'] = markdown.markdown(result['explanation'])
        
        # Return successful response
        return jsonify({
            'success': True,
            'explanation': result['explanation'],
            'personality': result['personality'],
            'model': result.get('model', 'Unknown'),
            'tokens': result.get('tokens', {})
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'api_key_configured': bool(os.getenv('GROQ_API_KEY'))
    })

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )