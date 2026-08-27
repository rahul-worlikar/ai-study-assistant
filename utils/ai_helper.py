"""
AI Helper module for Groq API integration
"""

import os
from groq import Groq
from dotenv import load_dotenv
from .prompts import get_personality_prompt

# Load environment variables
load_dotenv()

class AIStudyAssistant:
    def __init__(self):
        """Initialize the Groq client with API key"""
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        # Initialize Groq client
        self.client = Groq(api_key=self.api_key)
        
        # Updated models after deprecation (August 2026)
        self.models_to_try = [
            "openai/gpt-oss-120b",      # Best quality
            "openai/gpt-oss-20b",       # Fast responses
            "qwen/qwen3.6-27b",         # Alternative
        ]
        
        # Find first working model
        self.default_model = self._find_working_model()
        
        if not self.default_model:
            print("⚠️  No working models found! Using default fallback.")
            self.default_model = "openai/gpt-oss-120b"
    
    def _find_working_model(self):
        """Find the first working model from the list"""
        print("🔍 Finding working Groq model...")
        
        for model in self.models_to_try:
            try:
                # Quick test with minimal request
                self.client.chat.completions.create(
                    messages=[{"role": "user", "content": "test"}],
                    model=model,
                    max_tokens=5
                )
                print(f"✅ Using model: {model}")
                return model
            except Exception as e:
                print(f"⚠️  Model {model} not available: {str(e)[:50]}...")
                continue
        
        return None
    
    def get_explanation(self, question, personality="friendly_tutor"):
        """
        Get a detailed explanation for a given question using the selected personality
        
        Args:
            question (str): The user's question
            personality (str): The personality key to use
            
        Returns:
            dict: Contains explanation and metadata
        """
        try:
            # Get the system prompt for the selected personality
            system_prompt = get_personality_prompt(personality)
            
            # Create the chat completion with improved parameters
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                model=self.default_model,
                temperature=0.7,      # ✅ Increased for more natural, creative responses
                max_tokens=2500,      # ✅ Increased for comprehensive explanations
                top_p=0.9,
                stream=False,
            )
            
            # Extract the response
            explanation = chat_completion.choices[0].message.content
            
            # Return explanation with metadata
            return {
                "explanation": explanation,
                "model": self.default_model,
                "personality": personality,
                "tokens": {
                    "prompt": chat_completion.usage.prompt_tokens,
                    "completion": chat_completion.usage.completion_tokens,
                    "total": chat_completion.usage.total_tokens
                }
            }
            
        except Exception as e:
            error_msg = str(e)
            
            # If model fails, try to find another one
            if "model_not_found" in error_msg or "decommissioned" in error_msg:
                print(f"⚠️  Model {self.default_model} failed. Finding new model...")
                self.default_model = self._find_working_model()
                if self.default_model:
                    # Retry with new model
                    return self.get_explanation(question, personality)
            
            return {
                "error": f"An error occurred: {error_msg}",
                "explanation": "I'm sorry, but I encountered an error while processing your request. Please try again later."
            }
    
    def generate_summary(self, question):
        """Generate a quick summary version of an explanation"""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a summarization expert. Provide a 2-3 sentence summary of the following concept:"},
                    {"role": "user", "content": question}
                ],
                model=self.default_model,
                temperature=0.5,      # Slightly higher for natural summaries
                max_tokens=300,
            )
            return chat_completion.choices[0].message.content
        except Exception:
            return "Summary generation failed."

# Create a singleton instance
assistant = AIStudyAssistant()