// timer.js

let timerInterval = null;
let totalSeconds = 0;
let isTimerRunning = false;

// Atualiza o display do cronômetro
function updateTimerDisplay() {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const timeStr = `${minutes}:${seconds}`;

    const overlayTimerDisplay = document.getElementById('overlayTimerDisplay');
    const mainTimerValue = document.getElementById('mainTimerValue');

    if (overlayTimerDisplay) overlayTimerDisplay.innerText = timeStr;
    if (mainTimerValue) mainTimerValue.innerText = timeStr;

    // Alerta visual caso passe dos 30 minutos recomendados
    if (totalSeconds >= 1800) {
        if (overlayTimerDisplay) overlayTimerDisplay.classList.add('limit-exceeded');
        if (mainTimerValue) mainTimerValue.style.color = "var(--pico-del-color)";
    } else {
        if (overlayTimerDisplay) overlayTimerDisplay.classList.remove('limit-exceeded');
        if (mainTimerValue) mainTimerValue.style.color = "var(--pico-ins-color)";
    }
}

// Inicia o cronômetro
function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    
    const btnOverlayStart = document.getElementById('btnOverlayStart');
    const btnOverlayPause = document.getElementById('btnOverlayPause');
    if (btnOverlayStart) {
        btnOverlayStart.innerText = "Executando...";
        btnOverlayStart.disabled = true;
    }
    if (btnOverlayPause) btnOverlayPause.disabled = false;
    
    timerInterval = setInterval(() => {
        totalSeconds++;
        updateTimerDisplay();
    }, 1000);
}

// Pausa o cronômetro
function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    const btnOverlayStart = document.getElementById('btnOverlayStart');
    const btnOverlayPause = document.getElementById('btnOverlayPause');
    if (btnOverlayStart) {
        btnOverlayStart.innerText = "Continuar";
        btnOverlayStart.disabled = false;
    }
    if (btnOverlayPause) btnOverlayPause.disabled = true;
}

// Para e reinicia o cronômetro
function stopAndResetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    totalSeconds = 0;
    updateTimerDisplay();
}
