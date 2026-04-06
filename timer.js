// Timer variables
let timeLeft = 25 * 60; // Default 25 minutes
let timerInterval = null;
let isRunning = false;
let currentMode = 'study'; // 'study', 'shortBreak', 'longBreak'
let completedSessions = 0;
let points = 0;

// Settings
let studyMinutes = 25;
let shortBreakMinutes = 5;
let longBreakMinutes = 15;
let longBreakEvery = 4;

// DOM elements
const timeDisplay = document.getElementById('timeDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionLabel = document.getElementById('sessionLabel');
const completedCount = document.getElementById('completedCount');
const pointsCount = document.getElementById('pointsCount');
const ringProgress = document.getElementById('ringProgress');
const sessionLog = document.getElementById('sessionLog');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize progress ring
    const circumference = 2 * Math.PI * 52;
    ringProgress.style.strokeDasharray = `${circumference} ${circumference}`;

    updateDisplay();
    loadSettings();
    loadHistory();
    updateProgressRing();

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Settings
    document.getElementById('studyMinutes').addEventListener('change', updateSettings);
    document.getElementById('shortBreak').addEventListener('change', updateSettings);
    document.getElementById('longBreak').addEventListener('change', updateSettings);
    document.getElementById('longEvery').addEventListener('change', updateSettings);

    // Break buttons
    document.getElementById('breakDrink').addEventListener('click', () => startCustomBreak(2));
    document.getElementById('breakStretch').addEventListener('click', () => startCustomBreak(5));
    document.getElementById('breakWalk').addEventListener('click', () => startCustomBreak(10));

    // Other buttons
    document.getElementById('redeemBtn').addEventListener('click', redeemPoints);
    document.getElementById('clearLog').addEventListener('click', clearHistory);
});

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateProgressRing() {
    const totalTime = getTotalTimeForMode();
    const progress = (totalTime - timeLeft) / totalTime;
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (progress * circumference);
    ringProgress.style.strokeDashoffset = offset;
}

function getTotalTimeForMode() {
    switch(currentMode) {
        case 'study': return studyMinutes * 60;
        case 'shortBreak': return shortBreakMinutes * 60;
        case 'longBreak': return longBreakMinutes * 60;
        default: return studyMinutes * 60;
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgressRing();

            if (timeLeft <= 0) {
                timerEnd();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    pauseTimer();
    timeLeft = getTotalTimeForMode();
    updateDisplay();
    updateProgressRing();
}

function timerEnd() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // Play alarm sound
    playAlarm();

    // Show notification
    showNotification();

    if (currentMode === 'study') {
        completedSessions++;
        points += studyMinutes;
        updateCompletedCount();
        updatePointsCount();
        logSession(`Study session completed (${studyMinutes} min)`);

        // Determine next break
        if (completedSessions % longBreakEvery === 0) {
            switchToMode('longBreak');
        } else {
            switchToMode('shortBreak');
        }
    } else {
        // Break ended
        logSession(`${currentMode === 'shortBreak' ? 'Short' : 'Long'} break completed`);
        switchToMode('study');
    }
}

function switchToMode(mode) {
    currentMode = mode;
    let duration;
    switch(mode) {
        case 'study':
            duration = studyMinutes;
            sessionLabel.textContent = 'Study Time';
            break;
        case 'shortBreak':
            duration = shortBreakMinutes;
            sessionLabel.textContent = 'Short Break';
            break;
        case 'longBreak':
            duration = longBreakMinutes;
            sessionLabel.textContent = 'Long Break';
            break;
    }
    timeLeft = duration * 60;
    updateDisplay();
    updateProgressRing();
}

function startCustomBreak(minutes) {
    currentMode = 'customBreak';
    timeLeft = minutes * 60;
    sessionLabel.textContent = `${minutes} Minute Break`;
    updateDisplay();
    updateProgressRing();
    startTimer();
}

function playAlarm() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Fallback: try to play a system beep or just alert
        console.log('Audio not available, using alert');
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
            body: `${currentMode === 'study' ? 'Study session' : 'Break'} is over!`,
            icon: '/favicon.ico' // Add an icon if available
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Timer Complete!', {
                    body: `${currentMode === 'study' ? 'Study session' : 'Break'} is over!`,
                    icon: '/favicon.ico'
                });
            }
        });
    }
    // Always show alert as fallback
    alert(`${currentMode === 'study' ? 'Study session' : 'Break'} is over!`);
}

function updateSettings() {
    studyMinutes = parseInt(document.getElementById('studyMinutes').value) || 25;
    shortBreakMinutes = parseInt(document.getElementById('shortBreak').value) || 5;
    longBreakMinutes = parseInt(document.getElementById('longBreak').value) || 15;
    longBreakEvery = parseInt(document.getElementById('longEvery').value) || 4;

    // Save to localStorage
    localStorage.setItem('studyMinutes', studyMinutes);
    localStorage.setItem('shortBreakMinutes', shortBreakMinutes);
    localStorage.setItem('longBreakMinutes', longBreakMinutes);
    localStorage.setItem('longBreakEvery', longBreakEvery);

    if (currentMode === 'study' && !isRunning) {
        timeLeft = studyMinutes * 60;
        updateDisplay();
        updateProgressRing();
    }
}

function updateCompletedCount() {
    completedCount.textContent = completedSessions;
    localStorage.setItem('completedSessions', completedSessions);
}

function updatePointsCount() {
    pointsCount.textContent = points;
    localStorage.setItem('points', points);
}

function logSession(message) {
    const entry = `${new Date().toLocaleString()}: ${message}`;
    const li = document.createElement('li');
    li.textContent = entry;
    sessionLog.appendChild(li);
    sessionLog.scrollTop = sessionLog.scrollHeight;

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('sessionHistory')) || [];
    history.push(entry);
    localStorage.setItem('sessionHistory', JSON.stringify(history));
}

function loadSettings() {
    // Load from localStorage if available
    studyMinutes = parseInt(localStorage.getItem('studyMinutes')) || 25;
    shortBreakMinutes = parseInt(localStorage.getItem('shortBreakMinutes')) || 5;
    longBreakMinutes = parseInt(localStorage.getItem('longBreakMinutes')) || 15;
    longBreakEvery = parseInt(localStorage.getItem('longBreakEvery')) || 4;

    document.getElementById('studyMinutes').value = studyMinutes;
    document.getElementById('shortBreak').value = shortBreakMinutes;
    document.getElementById('longBreak').value = longBreakMinutes;
    document.getElementById('longEvery').value = longBreakEvery;
}

function loadHistory() {
    completedSessions = parseInt(localStorage.getItem('completedSessions')) || 0;
    points = parseInt(localStorage.getItem('points')) || 0;
    updateCompletedCount();
    updatePointsCount();

    const history = JSON.parse(localStorage.getItem('sessionHistory')) || [];
    history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        sessionLog.appendChild(li);
    });
}

function redeemPoints() {
    if (points >= 100) {
        points -= 100;
        updatePointsCount();
        localStorage.setItem('points', points);
        alert('Points redeemed! Check your rewards.');
        // Here you could show a reward modal
    } else {
        alert('You need at least 100 points to redeem.');
    }
}

function clearHistory() {
    sessionLog.innerHTML = '';
    localStorage.removeItem('sessionHistory');
}
