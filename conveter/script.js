const startBtn = document.querySelector('.start-btn');
const copyBtn = document.querySelector('.copy-btn');
const clearBtn = document.querySelector('.clear-btn');
const saveBtn = document.querySelector('.save-btn');
const textBox = document.querySelector('.text-box');
const status = document.querySelector('.status');
const languageSelect = document.getElementById('language');
const audioVisualization = document.querySelector('.audio-visualization');

let recognition = null;
let isRecording = false;

// Initialize Speech Recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        setupRecognition();
        enableButtons();
    } else {
        status.textContent = 'Speech recognition is not supported in this browser';
        disableButtons();
    }
}

// Setup Recognition Settings
function setupRecognition() {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageSelect.value;

    // Recognition Events
    recognition.onstart = handleRecognitionStart;
    recognition.onend = handleRecognitionEnd;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
}

// Event Handlers
function handleRecognitionStart() {
    status.textContent = 'Listening...';
    startBtn.classList.add('pulse');
    startBtn.style.background = '#f44336';
    startBtn.innerHTML = '<i class="mic-icon">🎤</i>Stop Recording';
    audioVisualization.classList.add('recording');
}

function handleRecognitionEnd() {
    status.textContent = 'Click "Start Recording" to begin';
    startBtn.classList.remove('pulse');
    startBtn.style.background = '#4CAF50';
    startBtn.innerHTML = '<i class="mic-icon">🎤</i>Start Recording';
    audioVisualization.classList.remove('recording');
    isRecording = false;
}

function handleRecognitionResult(event) {
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
        }
    }
    
    if (finalTranscript) {
        textBox.value += finalTranscript;
        textBox.scrollTop = textBox.scrollHeight;
    }
}

function handleRecognitionError(event) {
    status.textContent = `Error occurred: ${event.error}`;
    startBtn.classList.remove('pulse');
    startBtn.style.background = '#4CAF50';
    startBtn.innerHTML = '<i class="mic-icon">🎤</i>Start Recording';
    audioVisualization.classList.remove('recording');
    isRecording = false;
}

// Button Actions
function toggleRecording() {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
    } else {
        recognition.stop();
        isRecording = false;
    }
}

function copyText() {
    if (textBox.value) {
        navigator.clipboard.writeText(textBox.value)
            .then(() => {
                showStatusMessage('Text copied to clipboard!');
            })
            .catch(err => {
                showStatusMessage('Failed to copy text: ' + err);
            });
    }
}

function clearText() {
    textBox.value = '';
    showStatusMessage('Text cleared');
}

function saveText() {
    if (textBox.value) {
        const blob = new Blob([textBox.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showStatusMessage('Text saved successfully!');
    }
}

// Utility Functions
function showStatusMessage(message) {
    status.textContent = message;
    setTimeout(() => {
        status.textContent = isRecording ? 'Listening...' : 'Click "Start Recording" to begin';
    }, 2000);
}

function enableButtons() {
    startBtn.disabled = false;
    copyBtn.disabled = false;
    clearBtn.disabled = false;
    saveBtn.disabled = false;
}

function disableButtons() {
    startBtn.disabled = true;
    copyBtn.disabled = true;
    clearBtn.disabled = true;
    saveBtn.disabled = true;
}

// Event Listeners
startBtn.addEventListener('click', toggleRecording);
copyBtn.addEventListener('click', copyText);
clearBtn.addEventListener('click', clearText);
saveBtn.addEventListener('click', saveText);
languageSelect.addEventListener('change', () => {
    if (recognition) {
        recognition.lang = languageSelect.value;
    }
});

// Initialize the application
initializeSpeechRecognition();