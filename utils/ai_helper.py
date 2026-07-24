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
        
        # Updated to current supported models
        # As of 2024, these are the recommended models:
        self.available_models = {
            "llama3-70b": "llama3-70b-8192",      # Most capable
            "llama3-8b": "llama3-8b-8192",        # Fast and capable
            "gemma2-9b": "gemma2-9b-it",          # Google's model
            "mixtral": "mixtral-8x7b-32768",      # DEPRECATED - do not use
        }
        
        # Use the best available model
        self.default_model = "llama-3.3-70b-versatile"
    
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
            
            # Create the chat completion with updated model
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                model=self.default_model,  # Using llama3-70b-8192
                temperature=0.3,
                max_tokens=2000,
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
            return {
                "error": f"An error occurred: {str(e)}",
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
                temperature=0.3,
                max_tokens=300,
            )
            return chat_completion.choices[0].message.content
        except Exception:
            return "Summary generation failed."

# Create a singleton instance
assistant = AIStudyAssistant()