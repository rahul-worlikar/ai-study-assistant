// JavaScript for AI Study Assistant Pro

let currentQuestion = '';
let currentPersonality = '';

async function askQuestion() {
    const question = document.getElementById('question').value.trim();
    const personality = document.getElementById('personality').value;
    const loadingDiv = document.getElementById('loading');
    const responseArea = document.getElementById('responseArea');
    const askButton = document.getElementById('askButton');

    // Validate input
    if (!question) {
        showNotification('Please enter a question!', 'warning');
        return;
    }

    // Store current question for regenerate
    currentQuestion = question;
    currentPersonality = personality;

    // Show loading, hide previous response
    loadingDiv.classList.remove('hidden');
    responseArea.classList.add('hidden');
    askButton.disabled = true;
    askButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                personality: personality
            })
        });

        const data = await response.json();

        loadingDiv.classList.add('hidden');

        if (data.error) {
            showNotification(data.error, 'error');
            return;
        }

        displayExplanation(data);
        responseArea.classList.remove('hidden');
        responseArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        loadingDiv.classList.add('hidden');
        showNotification('An error occurred: ' + error.message, 'error');
    } finally {
        askButton.disabled = false;
        askButton.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Get Explanation</span>';
    }
}

function displayExplanation(data) {
    const explanationDiv = document.getElementById('explanation');
    const metadataDiv = document.getElementById('metadata');
    const personalityDisplay = document.getElementById('personalityDisplay');

    // Update personality badge
    const personalityMap = {
        'friendly_tutor': 'Friendly Tutor',
        'academic_professor': 'Academic Professor',
        'elaborate_explainer': 'Elaborate Explainer',
        'concise_educator': 'Concise Educator'
    };
    personalityDisplay.innerHTML = `<i class="fas fa-user-tag"></i> <span>${personalityMap[data.personality] || 'Custom'}</span>`;

    // Format explanation
    let explanation = data.explanation;
    explanation = explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    explanation = explanation.replace(/\*(.*?)\*/g, '<em>$1</em>');
    explanation = explanation.replace(/### (.*?)\n/g, '<h3>$1</h3>');
    explanation = explanation.replace(/## (.*?)\n/g, '<h2>$1</h2>');
    explanation = explanation.replace(/# (.*?)\n/g, '<h1>$1</h1>');
    explanation = explanation.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    explanation = explanation.replace(/`([^`]+)`/g, '<code>$1</code>');
    explanation = explanation.replace(/\n/g, '<br>');
    
    explanationDiv.innerHTML = explanation;

    // Update metadata
    if (data.tokens) {
        metadataDiv.innerHTML = `
            <span><i class="fas fa-microchip"></i> Model: ${data.model || 'Groq AI'}</span>
            <span><i class="fas fa-tachometer-alt"></i> Tokens: ${data.tokens.total || 0}</span>
            <span><i class="fas fa-clock"></i> ${new Date().toLocaleTimeString()}</span>
        `;
    } else {
        metadataDiv.innerHTML = `
            <span><i class="fas fa-microchip"></i> Powered by Groq AI</span>
        `;
    }
}

async function regenerateResponse() {
    if (!currentQuestion) {
        showNotification('No question to regenerate', 'warning');
        return;
    }
    
    // Re-run the question with the same parameters
    const askButton = document.getElementById('askButton');
    askButton.disabled = true;
    askButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
    
    // Reset the question in the textarea
    document.getElementById('question').value = currentQuestion;
    document.getElementById('personality').value = currentPersonality;
    
    await askQuestion();
}

function copyExplanation() {
    const explanationDiv = document.getElementById('explanation');
    const text = explanationDiv.innerText;
    
    if (!text) {
        showNotification('Nothing to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy text', 'error');
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6366f1'
    };
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        backgroundColor: colors[type] || colors.info,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slideIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Keyboard shortcut: Ctrl+Enter to submit
document.getElementById('question').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        askQuestion();
    }
});

// Auto-resize textarea
document.getElementById('question').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Select all text on focus
document.getElementById('question').addEventListener('focus', function() {
    this.select();
});