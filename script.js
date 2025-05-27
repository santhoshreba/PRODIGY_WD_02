// Variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let running = false;
let lapCount = 0;
let lapTimes = [];
let bestLapTime = Infinity;
let worstLapTime = 0;
let lastLapTime = 0;
let showMilliseconds = true;
let keyboardEnabled = true;
let currentTheme = 'theme1';

// DOM Elements
const timeValue = document.getElementById('timeValue');
const msValue = document.getElementById('msValue');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsContainer = document.getElementById('lapsContainer');
const clearLapsBtn = document.getElementById('clearLapsBtn');
const progressIndicator = document.getElementById('progressIndicator');
const settingsIcon = document.getElementById('settingsIcon');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const showMillisecondsToggle = document.getElementById('showMilliseconds');
const keyboardShortcutsToggle = document.getElementById('keyboardShortcuts');
const themeOptions = document.querySelectorAll('.theme-option');
const notification = document.getElementById('notification');

// Constants
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * 130;

// Format time to display
function formatTime(timeInMs, includeMs = true) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeInMs % 1000));
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');
    
    if (includeMs) {
        return { 
            time: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`, 
            ms: `.${formattedMilliseconds}` 
        };
    } else {
        return { 
            time: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`, 
            ms: '' 
        };
    }
}

// Update the display
function updateDisplay() {
    const currentTime = running ? Date.now() - startTime + elapsedTime : elapsedTime;
    const formattedTime = formatTime(currentTime, showMilliseconds);
    timeValue.textContent = formattedTime.time;
    msValue.textContent = formattedTime.ms;
    msValue.style.display = showMilliseconds ? 'inline' : 'none';
    
    // Update progress ring
    const seconds = (currentTime / 1000) % 60;
    const progress = (seconds / 60) * PROGRESS_RING_CIRCUMFERENCE;
    progressIndicator.style.strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE - progress;
}

// Start the stopwatch
function start() {
    if (!running) {
        startTime = Date.now();
        timerInterval = setInterval(updateDisplay, 10);
        running = true;
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        timeValue.classList.add('ticking');
        showNotification("Stopwatch started");
        
        // Animate buttons
        pauseBtn.classList.add('pulse');
        setTimeout(() => pauseBtn.classList.remove('pulse'), 1000);
    }
}

// Pause the stopwatch
function pause() {
    if (running) {
        clearInterval(timerInterval);
        elapsedTime += Date.now() - startTime;
        running = false;
        pauseBtn.style.display = 'none';
        startBtn.style.display = 'flex';
        timeValue.classList.remove('ticking');
        showNotification("Stopwatch paused");
        
        // Animate buttons
        startBtn.classList.add('pulse');
        setTimeout(() => startBtn.classList.remove('pulse'), 1000);
    }
}

// Toggle start/pause
function toggleStartPause() {
    if (running) {
        pause();
    } else {
        start();
    }
}

// Reset the stopwatch
function reset() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    running = false;
    updateDisplay();
    timeValue.classList.remove('ticking');
    progressIndicator.style.strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE;
    
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'flex';
    
    showNotification("Stopwatch reset");
}

// Record lap time
function lap() {
    if (running || elapsedTime > 0) {
        lapCount++;
        const currentTime = running ? Date.now() - startTime + elapsedTime : elapsedTime;
        const lapDuration = currentTime - lastLapTime;
        lastLapTime = currentTime;
        
        lapTimes.push({
            number: lapCount,
            totalTime: currentTime,
            lapTime: lapDuration
        });
        
        // Update best and worst lap times
        if (lapCount > 1) { // Skip first lap for best/worst calculation
            if (lapDuration < bestLapTime) {
                bestLapTime = lapDuration;
                updateLapHighlights();
            }
            
            if (lapDuration > worstLapTime) {
                worstLapTime = lapDuration;
                updateLapHighlights();
            }
        }
        
        renderLaps();
        showNotification(`Lap ${lapCount} recorded`);
        
        // Animate the lap button
        lapBtn.classList.add('pulse');
        setTimeout(() => lapBtn.classList.remove('pulse'), 500);
    }
}

// Clear all laps
function clearLaps() {
    lapCount = 0;
    lapTimes = [];
    lastLapTime = running ? Date.now() - startTime + elapsedTime : elapsedTime;
    bestLapTime = Infinity;
    worstLapTime = 0;
    lapsContainer.innerHTML = '';
    showNotification("Lap times cleared");
}

// Update best and worst lap highlights
function updateLapHighlights() {
    const lapItems = document.querySelectorAll('.lap-item');
    
    lapItems.forEach(item => {
        item.classList.remove('best-lap', 'worst-lap');
        
        const lapIndex = parseInt(item.getAttribute('data-index')) - 1;
        if (lapIndex > 0) { // Skip first lap
            if (lapTimes[lapIndex].lapTime === bestLapTime) {
                item.classList.add('best-lap');
            }
            
            if (lapTimes[lapIndex].lapTime === worstLapTime) {
                item.classList.add('worst-lap');
            }
        }
    });
}

// Render lap times
function renderLaps() {
    lapsContainer.innerHTML = '';
    
    lapTimes.forEach((lap, index) => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.setAttribute('data-index', lap.number);
        
        const formattedLapTime = formatTime(lap.lapTime, showMilliseconds);
        const formattedTotalTime = formatTime(lap.totalTime, showMilliseconds);
        
        lapItem.innerHTML = `
            <div class="lap-number">Lap ${lap.number}</div>
            <div class="lap-time">${formattedLapTime.time}${formattedLapTime.ms}</div>
            <div class="lap-total">${formattedTotalTime.time}${formattedTotalTime.ms}</div>
        `;
        
        // Highlight best and worst laps
        if (index > 0) { // Skip first lap
            if (lap.lapTime === bestLapTime) {
                lapItem.classList.add('best-lap');
            }
            
            if (lap.lapTime === worstLapTime) {
                lapItem.classList.add('worst-lap');
            }
        }
        
        lapsContainer.prepend(lapItem);
    });
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Toggle milliseconds display
function toggleMilliseconds() {
    showMilliseconds = !showMilliseconds;
    showMillisecondsToggle.checked = showMilliseconds;
    updateDisplay();
    renderLaps();
    showNotification(showMilliseconds ? "Milliseconds shown" : "Milliseconds hidden");
}

// Apply theme
function applyTheme(theme) {
    const themeColors = {
        theme1: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            accent: '#f59e0b'
        },
        theme2: {
            primary: '#f43f5e',
            secondary: '#ec4899',
            accent: '#fbbf24'
        },
        theme3: {
            primary: '#10b981',
            secondary: '#14b8a6',
            accent: '#06b6d4'
        },
        theme4: {
            primary: '#334155',
            secondary: '#475569',
            accent: '#94a3b8'
        }
    };
    
    document.documentElement.style.setProperty('--primary-color', themeColors[theme].primary);
    document.documentElement.style.setProperty('--secondary-color', themeColors[theme].secondary);
    document.documentElement.style.setProperty('--accent-color', themeColors[theme].accent);
    
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        }
    });
    
    currentTheme = theme;
    showNotification(`Theme changed to ${theme.replace('theme', 'Theme ')}`);
}

// Toggle settings panel
function toggleSettings() {
    settingsPanel.classList.toggle('open');
}

// Event listeners
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', lap);
clearLapsBtn.addEventListener('click', clearLaps);
display.addEventListener('click', toggleMilliseconds);
settingsIcon.addEventListener('click', toggleSettings);
closeSettings.addEventListener('click', toggleSettings);

showMillisecondsToggle.addEventListener('change', function() {
    showMilliseconds = this.checked;
    updateDisplay();
    renderLaps();
});

keyboardShortcutsToggle.addEventListener('change', function() {
    keyboardEnabled = this.checked;
    showNotification(keyboardEnabled ? "Keyboard shortcuts enabled" : "Keyboard shortcuts disabled");
});

themeOptions.forEach(option => {
    option.addEventListener('click', function() {
        const theme = this.getAttribute('data-theme');
        applyTheme(theme);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (keyboardEnabled) {
        if (e.code === 'Space') {
            e.preventDefault();
            toggleStartPause();
        }
        
        if (e.code === 'KeyR') {
            reset();
        }
        
        if (e.code === 'KeyL') {
            lap();
        }
        
        if (e.code === 'KeyS') {
            toggleSettings();
        }
    }
});

// Initialize the app
window.addEventListener('load', function() {
    reset();
    updateDisplay();
});