<div align="center">

# 📚 AI Study Assistant

### An Intelligent Learning Companion Powered by Groq AI

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Groq](https://img.shields.io/badge/Groq-API-5500FF?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=mit&logoColor=white)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-10B981?style=for-the-badge)]()

</div>

---

## 🎯 Overview

The **AI Study Assistant** is a sophisticated web application that leverages Groq's high-performance AI models to provide detailed, context-aware explanations on any topic. Whether you're a student preparing for exams, a professional learning new concepts, or simply curious about the world, this assistant adapts to your learning style with multiple teaching personalities.

**Key Value Proposition:**
- ⚡ **Lightning-fast responses** powered by Groq's cutting-edge inference engine
- 🎭 **Multiple teaching styles** to match your learning preference
- 🎨 **Modern, responsive UI** with smooth animations and intuitive interactions
- 🔒 **Secure API key management** with environment variables
- 📱 **Mobile-optimized** for learning on the go

---

## ✨ Features

### 🎓 Personalized Teaching Styles

Choose from four distinct AI personalities, each designed for different learning needs:

| Personality | Best For | Style |
|-------------|----------|-------|
| **Friendly Tutor** | Beginners & casual learners | Warm, encouraging, uses analogies and real-world examples |
| **Academic Professor** | In-depth study & research | Formal, precise, lecture-style with theoretical foundations |
| **Elaborate Explainer** | Comprehensive understanding | Extremely detailed, systematic, leaves no stone unturned |
| **Concise Educator** | Quick learning & summaries | Focused, efficient, gets straight to the point |

### 🛠️ Core Functionality

- **Ask Anything**: Type any question about any topic
- **Instant Responses**: Real-time AI-generated explanations
- **Copy to Clipboard**: Save explanations for later reference
- **Regenerate**: Get fresh perspectives on the same question
- **Keyboard Shortcuts**: `Ctrl+Enter` to submit questions quickly
- **Token Tracking**: See how many tokens each response uses

### 🎨 User Experience

- **Smooth Animations**: Professional loading states and transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Toast Notifications**: Clear feedback for all actions
- **Auto-resizing Textarea**: Grows with your questions
- **Status Indicators**: Visual feedback for system state

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Groq API Key** ([Get it here](https://console.groq.com/keys))
- **Git** ([Download](https://git-scm.com/downloads))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rahul-worlikar/ai-study-assistant.git
cd ai-study-assistant

# 2. Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
# Create a .env file in the root directory with:
# GROQ_API_KEY=your_api_key_here
# FLASK_ENV=development
# SECRET_KEY=your_secret_key_here

# 5. Run the application
python app.py

# 6. Open your browser and navigate to:
# http://localhost:5000