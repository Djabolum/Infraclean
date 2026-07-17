/**
 * Infraclean Simulator Engine - Multilingual JavaScript (FR, EN, ES)
 * Features: Web Audio API (with pulse & sweep modulation), Canvas wave visualizer, canvas dust, water & mic-dust physics, Alexa localized NLP simulator.
 */

// --- Variables d'état ---
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let analyser = null;
let isAudioPlaying = false;

let currentFreq = 0;
let currentAmp = 0.5;
let currentWaveType = 'sine'; // 'sine' | 'triangle' | 'sawtooth'

let dirtScanInterval = null;
let isScanningDirt = false;
let isTurboActive = false;
let activeSurface = null;
let isWaterEjectActive = false;
let waterEjectInterval = null;
let isMicCalibrating = false;
let micCalibrateTimeout = null;
let isMicOptimized = false;
let currentLang = 'fr-FR'; // Langue UI par défaut

// --- Dictionnaire des traductions UI ---
const UI_TRANSLATIONS = {
    'fr-FR': {
        waveVisualizerTitle: "Visualiseur d'Ondes Acoustiques",
        btnAudioActivate: "Activer l'Audio",
        btnAudioDeactivate: "Arrêter Vibrations",
        volumeLabel: "Volume",
        dustInstruction: "Des particules de poussière ou de l'eau sont déposées sur le dessus de l'Echo Dot.<br>Activez les vibrations pour les observer s'éjecter de la grille.",
        surfaceCalibrationTitle: "Calibrage par Surface",
        dirtDetectionTitle: "Détection de Saleté",
        dirtRateLabel: "Taux détecté :",
        btnScan: "Analyser Acoustique",
        btnScanning: "Analyse...",
        turboLabel: "Mode Turbo",
        alexaChatTitle: "Console Vocale Alexa",
        chatPlaceholder: "Tapez une commande (ex: Alexa, active le mode turbo)...",
        surfaces: ["Bois", "Verre", "Métal", "Tissu"],
        welcomeAlexa: "Infraclean est prêt. Dites par exemple : \"Alexa, ouvre Infraclean\", \"Alexa, évacue l'eau\" ou \"Alexa, améliore l'écoute\" pour démarrer.",
        copyBtnText: "Copier",
        copiedBtnText: "Copié !",
        tagline: "Simulateur Alexa Echo Dot",
        waterEjectionTitle: "Expulsion d'Eau",
        waterEjectDesc: "Évacue l'humidité accumulée par pulsations sonores rapides à 165Hz.",
        btnWaterWet: "Inonder",
        btnWaterEject: "Expulser",
        btnWaterEjecting: "Expulsion...",
        
        // Nouveaux labels
        micCalibrateTitle: "Amélioration d'Écoute",
        micStatusLabel: "Statut Micro :",
        micCalibrateDesc: "Balayage aigu pour déboucher les ports et calibrage du bruit ambiant.",
        btnMicCalibrate: "Optimiser",
        btnMicCalibrating: "Calibrage...",
        statusMicStandard: "Standard",
        statusMicOptimized: "Optimisé (+25%)",
        
        turboTitle: "Mode Turbo",
        turboStatusLabel: "État Turbo :",
        turboDesc: "Vibrations de crête à 200Hz à amplitude maximale pour taches tenaces.",
        btnTurboActivate: "Activer Turbo",
        btnTurboDeactivate: "Désactiver Turbo"
    },
    'en-US': {
        waveVisualizerTitle: "Acoustic Wave Visualizer",
        btnAudioActivate: "Activate Audio",
        btnAudioDeactivate: "Stop Vibrations",
        volumeLabel: "Volume",
        dustInstruction: "Dust or water particles are settled on top of the Echo Dot.<br>Turn on vibrations to watch them get dislodged from the grill.",
        surfaceCalibrationTitle: "Surface Calibration",
        dirtDetectionTitle: "Dirt Detection",
        dirtRateLabel: "Detected Rate:",
        btnScan: "Scan Acoustics",
        btnScanning: "Scanning...",
        turboLabel: "Turbo Mode",
        alexaChatTitle: "Alexa Voice Console",
        chatPlaceholder: "Type a command (e.g., Alexa, calibrate for wood)...",
        surfaces: ["Wood", "Glass", "Metal", "Fabric"],
        welcomeAlexa: "Infraclean is ready. Say for example: \"Alexa, open Infraclean\", \"Alexa, eject water\" or \"Alexa, improve listening\" to start.",
        copyBtnText: "Copy",
        copiedBtnText: "Copied!",
        tagline: "Alexa Echo Dot Simulator",
        waterEjectionTitle: "Water Ejection",
        waterEjectDesc: "Evacuates settled moisture using rapid 165Hz sound pulses.",
        btnWaterWet: "Wet Device",
        btnWaterEject: "Eject",
        btnWaterEjecting: "Ejecting...",
        
        micCalibrateTitle: "Listening Improvement",
        micStatusLabel: "Mic Status:",
        micCalibrateDesc: "High-frequency sweep to clear ports and calibrate ambient noise.",
        btnMicCalibrate: "Optimize",
        btnMicCalibrating: "Tuning...",
        statusMicStandard: "Standard",
        statusMicOptimized: "Optimized (+25%)",
        
        turboTitle: "Turbo Mode",
        turboStatusLabel: "Turbo State:",
        turboDesc: "Peak 200Hz vibrations at maximum amplitude for stubborn stains.",
        btnTurboActivate: "Enable Turbo",
        btnTurboDeactivate: "Disable Turbo"
    },
    'es-ES': {
        waveVisualizerTitle: "Visualizador de Ondas Acústicas",
        btnAudioActivate: "Activar Audio",
        btnAudioDeactivate: "Detener Vibraciones",
        volumeLabel: "Volumen",
        dustInstruction: "Polvo o gotas de agua están depositadas sobre el Echo Dot.<br>Activa las vibraciones para verlas salir despedidas de la rejilla.",
        surfaceCalibrationTitle: "Calibración de Superficie",
        dirtDetectionTitle: "Detección de Suciedad",
        dirtRateLabel: "Tasa detectada:",
        btnScan: "Analizar Acústica",
        btnScanning: "Analizando...",
        turboLabel: "Modo Turbo",
        alexaChatTitle: "Consola de Voz Alexa",
        chatPlaceholder: "Escribe un comando (ej: Alexa, calibra para madera)...",
        surfaces: ["Madera", "Vidrio", "Metal", "Tejido"],
        welcomeAlexa: "Infraclean está lista. Di por ejemplo: \"Alexa, abre Infraclean\", \"Alexa, expulsa el agua\" o \"Alexa, mejora la escucha\" para comenzar.",
        copyBtnText: "Copiar",
        copiedBtnText: "¡Copiado!",
        tagline: "Simulador de Alexa Echo Dot",
        waterEjectionTitle: "Expulsión de Agua",
        waterEjectDesc: "Evacúa la humedad acumulada mediante pulsaciones sonoras rápidas a 165Hz.",
        btnWaterWet: "Inundar",
        btnWaterEject: "Expulsar",
        btnWaterEjecting: "Expulsando...",
        
        micCalibrateTitle: "Mejora de Escucha",
        micStatusLabel: "Estado Micro:",
        micCalibrateDesc: "Barrido agudo para desbloquear puertos y calibración de ruido ambiental.",
        btnMicCalibrate: "Optimizar",
        btnMicCalibrating: "Calibrando...",
        statusMicStandard: "Estándar",
        statusMicOptimized: "Optimizado (+25%)",
        
        turboTitle: "Modo Turbo",
        turboStatusLabel: "Estado Turbo:",
        turboDesc: "Vibraciones máximas de 200Hz a potencia total para manchas difíciles.",
        btnTurboActivate: "Activar Turbo",
        btnTurboDeactivate: "Desactivar Turbo"
    }
};

// --- Dictionnaire de suggestions par langue ---
const SUGGESTION_CHIPS = {
    'fr-FR': [
        { text: "Ouvre Infraclean", cmd: "Alexa, ouvre Infraclean" },
        { text: "Calibre pour le bois", cmd: "Alexa, calibre pour le bois" },
        { text: "Évacue l'eau", cmd: "Alexa, évacue l'eau" },
        { text: "Améliore l'écoute", cmd: "Alexa, améliore l'écoute" },
        { text: "Détecte la saleté", cmd: "Alexa, lance la détection de saleté" },
        { text: "Arrête", cmd: "Alexa, stop" }
    ],
    'en-US': [
        { text: "Open Infraclean", cmd: "Alexa, open Infraclean" },
        { text: "Calibrate for wood", cmd: "Alexa, calibrate for wood" },
        { text: "Eject water", cmd: "Alexa, eject water" },
        { text: "Improve listening", cmd: "Alexa, improve listening" },
        { text: "Detect dirt", cmd: "Alexa, start dirt detection" },
        { text: "Stop", cmd: "Alexa, stop" }
    ],
    'es-ES': [
        { text: "Abre Infraclean", cmd: "Alexa, abre Infraclean" },
        { text: "Calibra para madera", cmd: "Alexa, calibra para madera" },
        { text: "Expulsar agua", cmd: "Alexa, expulsa el agua" },
        { text: "Mejorar escucha", cmd: "Alexa, mejora la escucha" },
        { text: "Detectar suciedad", cmd: "Alexa, inicia la detección de suciedad" },
        { text: "Detener", cmd: "Alexa, stop" }
    ]
};

// --- Sélecteurs DOM ---
const langSelector = document.getElementById('langSelector');
const taglineDevice = document.getElementById('taglineDevice');

const txtWaveVisualizerTitle = document.getElementById('txtWaveVisualizerTitle');
const btnAudioToggle = document.getElementById('btnAudioToggle');
const txtBtnAudioActivate = document.getElementById('txtBtnAudioActivate');
const lblVolume = document.getElementById('lblVolume');
const sliderVolume = document.getElementById('sliderVolume');
const waveformCanvas = document.getElementById('waveformCanvas');
const freqDisplay = document.getElementById('freqDisplay');
const waveTypeLabel = document.getElementById('wave-type-label');

const echoDevice = document.getElementById('echoDevice');
const echoLedRing = document.getElementById('echoLedRing');
const particlesCanvas = document.getElementById('particlesCanvas');
const txtDustInstruction = document.getElementById('txtDustInstruction');

const txtSurfaceCalibrationTitle = document.getElementById('txtSurfaceCalibrationTitle');
const nameSurface1 = document.getElementById('nameSurface1');
const nameSurface2 = document.getElementById('nameSurface2');
const nameSurface3 = document.getElementById('nameSurface3');
const nameSurface4 = document.getElementById('nameSurface4');
const surfaceCards = document.querySelectorAll('.surface-card');

const txtDirtDetectionTitle = document.getElementById('txtDirtDetectionTitle');
const txtDirtRateLabel = document.getElementById('txtDirtRateLabel');
const btnScan = document.getElementById('btnScan');
const txtBtnScan = document.getElementById('txtBtnScan');
const dirtValue = document.getElementById('dirtValue');
const dirtBarFill = document.getElementById('dirtBarFill');

// Expulsion d'Eau DOM
const txtWaterEjectionTitle = document.getElementById('txtWaterEjectionTitle');
const txtWaterEjectDesc = document.getElementById('txtWaterEjectDesc');
const btnWaterWet = document.getElementById('btnWaterWet');
const txtBtnWaterWet = document.getElementById('txtBtnWaterWet');
const btnWaterEject = document.getElementById('btnWaterEject');
const txtBtnWaterEject = document.getElementById('txtBtnWaterEject');

// Amélioration d'écoute DOM
const txtMicCalibrateTitle = document.getElementById('txtMicCalibrateTitle');
const txtMicStatusLabel = document.getElementById('txtMicStatusLabel');
const micStatusValue = document.getElementById('micStatusValue');
const txtMicCalibrateDesc = document.getElementById('txtMicCalibrateDesc');
const btnMicCalibrate = document.getElementById('btnMicCalibrate');
const txtBtnMicCalibrate = document.getElementById('txtBtnMicCalibrate');

// Mode Turbo DOM
const txtTurboTitle = document.getElementById('txtTurboTitle');
const txtTurboStatusLabel = document.getElementById('txtTurboStatusLabel');
const turboStatusValue = document.getElementById('turboStatusValue');
const txtTurboDesc = document.getElementById('txtTurboDesc');
const btnTurbo = document.getElementById('btnTurbo');
const txtBtnTurbo = document.getElementById('txtBtnTurbo');

const txtAlexaChatTitle = document.getElementById('txtAlexaChatTitle');
const chatBox = document.getElementById('chatBox');
const chatSuggestions = document.getElementById('chatSuggestions');
const chatInput = document.getElementById('chatInput');
const btnSendChat = document.getElementById('btnSendChat');

// --- Chargement des codes source ---
document.addEventListener('DOMContentLoaded', () => {
    langSelector.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    setLanguage('fr-FR');
    setupTabs();
    initParticles();
    
    // Écouteurs d'événements audio
    btnAudioToggle.addEventListener('click', toggleAudio);
    sliderVolume.addEventListener('input', handleVolumeChange);
    
    // Écouteurs surface cards
    surfaceCards.forEach(card => {
        card.addEventListener('click', () => {
            const surface = card.dataset.surface;
            calibrateForSurface(surface);
        });
    });
    
    // Détection de saleté, Turbo, Eau et Micro
    btnScan.addEventListener('click', startDirtDetection);
    btnTurbo.addEventListener('click', toggleTurboMode);
    btnWaterWet.addEventListener('click', wetDeviceWithWater);
    btnWaterEject.addEventListener('click', startWaterEjectionCycle);
    btnMicCalibrate.addEventListener('click', startMicCalibration);
    
    // Chat
    btnSendChat.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });
    
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
});

// Réajuster les tailles de canevas
function resizeCanvases() {
    waveformCanvas.width = waveformCanvas.parentElement.clientWidth;
    waveformCanvas.height = waveformCanvas.parentElement.clientHeight;
    
    particlesCanvas.width = particlesCanvas.parentElement.clientWidth;
    particlesCanvas.height = particlesCanvas.parentElement.clientHeight;
}

// --- Système de Localisation de l'Interface ---
function setLanguage(lang) {
    currentLang = lang;
    const t = UI_TRANSLATIONS[lang];
    
    taglineDevice.textContent = t.tagline;
    txtWaveVisualizerTitle.textContent = t.waveVisualizerTitle;
    txtBtnAudioActivate.textContent = isAudioPlaying ? t.btnAudioDeactivate : t.btnAudioActivate;
    lblVolume.textContent = t.volumeLabel;
    txtDustInstruction.innerHTML = t.dustInstruction;
    txtSurfaceCalibrationTitle.textContent = t.surfaceCalibrationTitle;
    
    nameSurface1.textContent = t.surfaces[0];
    nameSurface2.textContent = t.surfaces[1];
    nameSurface3.textContent = t.surfaces[2];
    nameSurface4.textContent = t.surfaces[3];
    
    txtDirtDetectionTitle.textContent = t.dirtDetectionTitle;
    txtDirtRateLabel.textContent = t.dirtRateLabel;
    txtBtnScan.textContent = isScanningDirt ? t.btnScanning : t.btnScan;
    
    txtWaterEjectionTitle.textContent = t.waterEjectionTitle;
    txtWaterEjectDesc.textContent = t.waterEjectDesc;
    txtBtnWaterWet.textContent = t.btnWaterWet;
    txtBtnWaterEject.textContent = isWaterEjectActive ? t.btnWaterEjecting : t.btnWaterEject;
    
    // Nouveaux éléments traduits
    txtMicCalibrateTitle.textContent = t.micCalibrateTitle;
    txtMicStatusLabel.textContent = t.micStatusLabel;
    micStatusValue.textContent = isMicOptimized ? t.statusMicOptimized : t.statusMicStandard;
    txtMicCalibrateDesc.textContent = t.micCalibrateDesc;
    txtBtnMicCalibrate.textContent = isMicCalibrating ? t.btnMicCalibrating : t.btnMicCalibrate;
    
    txtTurboTitle.textContent = t.turboTitle;
    txtTurboStatusLabel.textContent = t.turboStatusLabel;
    turboStatusValue.textContent = isTurboActive ? "ON" : "OFF";
    txtTurboDesc.textContent = t.turboDesc;
    txtBtnTurbo.textContent = isTurboActive ? t.btnTurboDeactivate : t.btnTurboActivate;
    
    txtAlexaChatTitle.textContent = t.alexaChatTitle;
    chatInput.placeholder = t.chatPlaceholder;
    
    document.querySelectorAll('.txtCopyBtn').forEach(btnSpan => {
        btnSpan.textContent = t.copyBtnText;
    });
    
    updateSuggestions(lang);
    
    chatBox.innerHTML = '';
    const time = new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    const welcomeMsg = `
        <div class="message alexa">
            <div class="message-sender">Alexa</div>
            <div class="message-text">${t.welcomeAlexa}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatBox.innerHTML = welcomeMsg;
    
    loadSourceCodes();
}

function updateSuggestions(lang) {
    chatSuggestions.innerHTML = '';
    const chips = SUGGESTION_CHIPS[lang];
    chips.forEach(chip => {
        const span = document.createElement('span');
        span.className = 'suggestion-chip';
        span.textContent = chip.text;
        span.onclick = () => sendSuggestedMessage(chip.cmd);
        chatSuggestions.appendChild(span);
    });
}

// --- Système Audio (Web Audio API) ---

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(sliderVolume.value, audioCtx.currentTime);
        
        gainNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        drawWaveform();
    }
}

function startOscillator(freq, waveType = 'sine') {
    initAudio();
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    stopOscillator();
    
    oscillator = audioCtx.createOscillator();
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.connect(gainNode);
    
    oscillator.start();
    
    currentFreq = freq;
    currentWaveType = waveType;
    isAudioPlaying = true;
    
    freqDisplay.textContent = `${freq.toFixed(1)} Hz`;
    waveTypeLabel.textContent = waveType.toUpperCase();
    
    const t = UI_TRANSLATIONS[currentLang];
    txtBtnAudioActivate.textContent = t.btnAudioDeactivate;
    btnAudioToggle.classList.add('active');
    
    echoDevice.classList.add('vibrating');
    const vibeSpeed = Math.max(0.01, Math.min(0.1, 8 / freq));
    echoDevice.style.setProperty('--vibe-duration', `${vibeSpeed}s`);
}

function stopOscillator() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
    isAudioPlaying = false;
    echoDevice.classList.remove('vibrating');
    
    freqDisplay.textContent = `0.0 Hz`;
    const t = UI_TRANSLATIONS[currentLang];
    txtBtnAudioActivate.textContent = t.btnAudioActivate;
    btnAudioToggle.classList.remove('active');
}

function toggleAudio() {
    if (isAudioPlaying) {
        stopWaterEjectionAudio();
        stopMicCalibrationAudio();
        stopOscillator();
        setLedState('idle');
        resetActiveStates();
    } else {
        calibrateForSurface('bois');
    }
}

function handleVolumeChange() {
    currentAmp = parseFloat(sliderVolume.value);
    if (gainNode) {
        gainNode.gain.setValueAtTime(currentAmp, audioCtx.currentTime);
    }
}

function setLedState(state) {
    echoLedRing.className = 'echo-led-ring';
    echoLedRing.classList.add(`state-${state}`);
}

function resetActiveStates() {
    surfaceCards.forEach(c => c.classList.remove('active'));
    btnTurbo.classList.remove('active');
    btnWaterEject.classList.remove('active');
    btnMicCalibrate.classList.remove('active');
    
    const t = UI_TRANSLATIONS[currentLang];
    turboStatusValue.textContent = "OFF";
    txtBtnTurbo.textContent = t.btnTurboActivate;
    
    isTurboActive = false;
    activeSurface = null;
}

// --- Rendu Visualiseur d'Ondes ---
function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    
    const canvas = waveformCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    if (isAudioPlaying) {
        analyser.getByteTimeDomainData(dataArray);
    } else {
        for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = 128 + Math.sin(i * 0.1) * 2; 
        }
    }
    
    ctx.lineWidth = 3;
    
    let strokeStyle = '#00f2fe';
    let glowStyle = 'rgba(0, 242, 254, 0.5)';
    
    if (isTurboActive) {
        strokeStyle = '#ff0055';
        glowStyle = 'rgba(255, 0, 85, 0.6)';
    } else if (isWaterEjectActive) {
        strokeStyle = '#0055ff';
        glowStyle = 'rgba(0, 85, 255, 0.6)';
    } else if (isMicCalibrating) {
        strokeStyle = '#8b5cf6';
        glowStyle = 'rgba(139, 92, 246, 0.6)';
    } else if (isScanningDirt) {
        strokeStyle = '#ffb300';
        glowStyle = 'rgba(255, 179, 0, 0.5)';
    } else if (activeSurface === 'bois') {
        strokeStyle = '#a78bfa';
        glowStyle = 'rgba(167, 139, 250, 0.5)';
    } else if (activeSurface === 'verre') {
        strokeStyle = '#38bdf8';
        glowStyle = 'rgba(56, 189, 248, 0.5)';
    } else if (activeSurface === 'métal') {
        strokeStyle = '#34d399';
        glowStyle = 'rgba(52, 211, 153, 0.5)';
    }
    
    ctx.strokeStyle = strokeStyle;
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowStyle;
    
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}


// --- Moteur de Physique Canvas (Poussière, Eau & Micro-Poussière) ---
let particles = [];
const DUST_PARTICLE_COUNT = 150;

class InfracleanParticle {
    constructor(canvasWidth, canvasHeight, isInitial = false, type = 'dust') {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.type = type; // 'dust' | 'water' | 'mic-dust'
        this.reset(isInitial);
    }
    
    reset(isInitial = false) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2 - 20;
        
        const angle = Math.random() * Math.PI * 2;
        
        if (this.type === 'mic-dust') {
            // Les microphones physiques sont situés dans 4 petits orifices du capot supérieur (plateau central)
            // Rayon proche des boutons
            const radiusX = 35 + Math.random() * 25;
            const radiusY = 10 + Math.random() * 8;
            this.x = centerX + Math.cos(angle) * radiusX;
            this.y = centerY + Math.sin(angle) * radiusY;
            this.size = Math.random() * 1.5 + 0.6;
            this.color = `rgba(180, 150, 240, ${Math.random() * 0.5 + 0.4})`;
            this.gravity = 0.05;
            this.airResistance = 0.97;
        } else if (this.type === 'water') {
            const radiusX = Math.random() * 95; 
            const radiusY = Math.random() * 20; 
            this.x = centerX + Math.cos(angle) * radiusX;
            this.y = centerY + Math.sin(angle) * radiusY;
            this.size = Math.random() * 3.5 + 2.2;
            this.color = `rgba(${0 + Math.floor(Math.random() * 30)}, ${120 + Math.floor(Math.random() * 100)}, ${230 + Math.floor(Math.random() * 25)}, ${Math.random() * 0.3 + 0.6})`;
            this.gravity = 0.16;
            this.airResistance = 0.99;
        } else {
            // Poussière classique (grille)
            const radiusX = Math.random() * 95; 
            const radiusY = Math.random() * 20; 
            this.x = centerX + Math.cos(angle) * radiusX;
            this.y = centerY + Math.sin(angle) * radiusY;
            this.size = Math.random() * 2.2 + 0.8;
            this.color = `rgba(${200 + Math.floor(Math.random() * 55)}, ${200 + Math.floor(Math.random() * 55)}, ${200 + Math.floor(Math.random() * 55)}, ${Math.random() * 0.4 + 0.3})`;
            this.gravity = 0.08;
            this.airResistance = 0.98;
        }
        
        this.vx = 0;
        this.vy = 0;
        this.alpha = 1;
        this.active = true;
        
        if (isInitial) {
            this.isSettled = true;
        } else {
            this.isSettled = false;
        }
    }
    
    vibrate(strength, freq, optionFlags = {}) {
        if (this.isSettled) {
            this.isSettled = false;
            
            const angle = Math.random() * Math.PI - Math.PI; 
            
            if (this.type === 'mic-dust' && optionFlags.isMicSweep) {
                // Impulsion plus verticale et rapide (haute fréquence)
                const power = 7 + Math.random() * 6;
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = -Math.random() * power - 2;
            } else if (this.type === 'water') {
                const power = optionFlags.isPulseActive ? strength * 11.2 : strength * 0.8;
                this.vx = Math.cos(angle) * (Math.random() * power * 2);
                this.vy = Math.sin(angle) * (Math.random() * power * 3) - 2.5;
            } else {
                // Poussière normale
                const power = (strength * 4) + (freq / 45);
                this.vx = Math.cos(angle) * (Math.random() * power * 1.5);
                this.vy = Math.sin(angle) * (Math.random() * power * 3) - 1.5;
            }
        }
    }
    
    update(vibrationActive, strength, freq, optionFlags = {}) {
        if (this.isSettled) {
            if (vibrationActive) {
                this.vibrate(strength, freq, optionFlags);
            }
            return;
        }
        
        this.vy += this.gravity;
        this.vx *= this.airResistance;
        this.vy *= this.airResistance;
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'water' || this.type === 'mic-dust') {
            this.alpha -= 0.012;
            if (this.alpha <= 0 || this.y > this.canvasHeight || this.x < 0 || this.x > this.canvasWidth) {
                this.active = false; // Ne respawn pas auto
            }
        } else {
            this.alpha -= 0.008;
            if (this.alpha <= 0 || this.y > this.canvasHeight || this.x < 0 || this.x > this.canvasWidth) {
                this.reset(false);
                if (!vibrationActive) {
                    this.isSettled = true;
                    this.active = true;
                }
            }
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        
        if (this.type === 'water') {
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0, 100, 255, 0.4)';
        } else if (this.type === 'mic-dust') {
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    const width = particlesCanvas.width || 400;
    const height = particlesCanvas.height || 380;
    
    for (let i = 0; i < DUST_PARTICLE_COUNT; i++) {
        particles.push(new InfracleanParticle(width, height, true, 'dust'));
    }
    animateParticles();
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    
    const canvas = particlesCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const vibrationActive = isAudioPlaying;
    const strength = currentAmp;
    const freq = currentFreq;
    const isPulseActive = isWaterEjectActive;
    const isMicSweep = isMicCalibrating;
    
    particles = particles.filter(p => p.active);
    particles.forEach(p => {
        p.update(vibrationActive, strength, freq, { isPulseActive, isMicSweep });
        p.draw(ctx);
    });
}

function wetDeviceWithWater() {
    const width = particlesCanvas.width || 400;
    const height = particlesCanvas.height || 380;
    
    btnWaterWet.classList.add('active');
    setTimeout(() => btnWaterWet.classList.remove('active'), 200);
    
    for (let i = 0; i < 60; i++) {
        particles.push(new InfracleanParticle(width, height, true, 'water'));
    }
}


// --- Actions & Simulateur d'Intents Alexa ---

function calibrateForSurface(surface) {
    stopWaterEjectionAudio();
    stopMicCalibrationAudio();
    resetActiveStates();
    activeSurface = surface;
    
    const card = document.querySelector(`.surface-card[data-surface="${surface}"]`);
    if (card) card.classList.add('active');
    
    let freq = 80;
    if (surface === 'bois') freq = 80;
    else if (surface === 'verre') freq = 120;
    else if (surface === 'métal') freq = 160;
    else if (surface === 'tissu') freq = 50;
    
    setLedState('calibrating');
    startOscillator(freq, 'sine');
}

function toggleTurboMode() {
    stopWaterEjectionAudio();
    stopMicCalibrationAudio();
    const t = UI_TRANSLATIONS[currentLang];
    
    if (isTurboActive) {
        isTurboActive = false;
        resetActiveStates();
        stopOscillator();
        setLedState('idle');
    } else {
        resetActiveStates();
        isTurboActive = true;
        btnTurbo.classList.add('active');
        turboStatusValue.textContent = "ON";
        txtBtnTurbo.textContent = t.btnTurboDeactivate;
        setLedState('turbo');
        startOscillator(200, 'triangle');
    }
}

// Expulsion physique de l'eau (Vibrations modulées de 165Hz)
function startWaterEjectionCycle() {
    if (isWaterEjectActive) {
        stopWaterEjectionAudio();
        return;
    }
    
    stopOscillator();
    stopMicCalibrationAudio();
    resetActiveStates();
    
    isWaterEjectActive = true;
    const t = UI_TRANSLATIONS[currentLang];
    btnWaterEject.classList.add('ejecting');
    txtBtnWaterEject.textContent = t.btnWaterEjecting;
    setLedState('water-ejecting');
    
    initAudio();
    startOscillator(165, 'sine');
    
    let pulseState = true;
    waterEjectInterval = setInterval(() => {
        if (gainNode) {
            gainNode.gain.setValueAtTime(pulseState ? currentAmp : 0.05, audioCtx.currentTime);
            
            if (pulseState) {
                echoDevice.classList.add('vibrating');
                particles.forEach(p => {
                    if (p.type === 'water') {
                        p.isSettled = false;
                        p.vibrate(currentAmp, 165, { isPulseActive: true });
                    }
                });
            } else {
                echoDevice.classList.remove('vibrating');
            }
            pulseState = !pulseState;
        }
    }, 150);
    
    // Cycle de 6 secondes
    setTimeout(() => {
        stopWaterEjectionAudio();
        setLedState('idle');
    }, 6000);
}

function stopWaterEjectionAudio() {
    if (waterEjectInterval) {
        clearInterval(waterEjectInterval);
        waterEjectInterval = null;
    }
    isWaterEjectActive = false;
    
    const t = UI_TRANSLATIONS[currentLang];
    btnWaterEject.classList.remove('ejecting');
    txtBtnWaterEject.textContent = t.btnWaterEject;
    stopOscillator();
}

// Amélioration d'Écoute (Balayage aigu de 1000Hz à 12000Hz + phase silencieuse)
function startMicCalibration() {
    if (isMicCalibrating) return;
    
    stopOscillator();
    stopWaterEjectionAudio();
    resetActiveStates();
    
    isMicCalibrating = true;
    const t = UI_TRANSLATIONS[currentLang];
    btnMicCalibrate.classList.add('active');
    txtBtnMicCalibrate.textContent = t.btnMicCalibrating;
    micStatusValue.textContent = t.btnMicCalibrating;
    setLedState('mic-calibrating');
    
    // Faire apparaître des poussières fines sur le dessus du microphone
    const width = particlesCanvas.width || 400;
    const height = particlesCanvas.height || 380;
    for (let i = 0; i < 40; i++) {
        particles.push(new InfracleanParticle(width, height, true, 'mic-dust'));
    }
    
    initAudio();
    startOscillator(1000, 'sine');
    
    // Balayage fréquentiel ascendant (1kHz -> 12kHz)
    let startFreq = 1000;
    const endFreq = 12000;
    const duration = 2000; // 2 secondes de sweep
    const steps = 40;
    const stepTime = duration / steps;
    const freqStep = (endFreq - startFreq) / steps;
    
    let currentStep = 0;
    const sweepInterval = setInterval(() => {
        if (!isMicCalibrating) {
            clearInterval(sweepInterval);
            return;
        }
        
        startFreq += freqStep;
        if (oscillator) {
            oscillator.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
            freqDisplay.textContent = `${startFreq.toFixed(0)} Hz`;
        }
        
        // Propulser les particules du micro lors des fréquences aiguës
        particles.forEach(p => {
            if (p.type === 'mic-dust') {
                p.isSettled = false;
                p.vibrate(currentAmp, startFreq, { isMicSweep: true });
            }
        });
        
        currentStep++;
        if (currentStep >= steps) {
            clearInterval(sweepInterval);
            
            // Phase silencieuse (Calibrage bruit de fond)
            stopOscillator();
            freqDisplay.textContent = "Silent Calibration...";
            
            // Pulsation lente de l'anneau LED en phase silencieuse
            setLedState('thinking');
            
            micCalibrateTimeout = setTimeout(() => {
                isMicCalibrating = false;
                isMicOptimized = true;
                
                btnMicCalibrate.classList.remove('active');
                txtBtnMicCalibrate.textContent = t.btnMicCalibrate;
                micStatusValue.textContent = t.statusMicOptimized;
                micStatusValue.style.color = 'var(--color-clean)';
                setLedState('idle');
                
                let doneText = "";
                if (currentLang === 'fr-FR') {
                    doneText = "Calibrage du micro terminé. Le seuil de bruit ambiant a été réévalué. Écoute améliorée de +25%.";
                } else if (currentLang === 'en-US') {
                    doneText = "Microphone calibration complete. Ambient noise threshold recalibrated. Listening sensitivity improved by +25%.";
                } else if (currentLang === 'es-ES') {
                    doneText = "Calibración del micrófono completada. Umbral de ruido ambiental recalculado. Sensibilidad de escucha optimizada en un +25%.";
                }
                addAlexaMessage(doneText);
                
            }, 1500);
        }
    }, stepTime);
}

function stopMicCalibrationAudio() {
    if (micCalibrateTimeout) {
        clearTimeout(micCalibrateTimeout);
        micCalibrateTimeout = null;
    }
    isMicCalibrating = false;
    
    const t = UI_TRANSLATIONS[currentLang];
    btnMicCalibrate.classList.remove('active');
    txtBtnMicCalibrate.textContent = t.btnMicCalibrate;
    micStatusValue.textContent = isMicOptimized ? t.statusMicOptimized : t.statusMicStandard;
    stopOscillator();
}

function startDirtDetection() {
    if (isScanningDirt) return;
    
    stopWaterEjectionAudio();
    stopMicCalibrationAudio();
    isScanningDirt = true;
    btnScan.classList.add('scanning');
    
    const t = UI_TRANSLATIONS[currentLang];
    txtBtnScan.textContent = t.btnScanning;
    setLedState('detecting');
    
    startOscillator(440, 'sine'); 
    setTimeout(() => stopOscillator(), 400);

    setTimeout(() => {
        const level = Math.floor(Math.random() * 80) + 15; 
        dirtValue.textContent = level;
        dirtBarFill.style.width = `${level}%`;
        
        btnScan.classList.remove('scanning');
        txtBtnScan.textContent = t.btnScan;
        isScanningDirt = false;
        
        let replyText = "";
        let autoFreq = 80;
        
        if (currentLang === 'fr-FR') {
            if (level < 35) {
                autoFreq = 60;
                replyText = `Analyse terminée. Taux de saleté faible (${level}%). Vibrations de nettoyage à ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else if (level < 70) {
                autoFreq = 100;
                replyText = `Analyse terminée. Taux de saleté moyen (${level}%). Augmentation des vibrations à ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else {
                autoFreq = 150;
                replyText = `Alerte : Taux de saleté élevé (${level}%). Ajustement automatique à haute puissance : ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sawtooth');
                setLedState('turbo');
            }
        } else if (currentLang === 'en-US') {
            if (level < 35) {
                autoFreq = 60;
                replyText = `Analysis complete. Low dirt level (${level}%). Tuning vibrations to ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else if (level < 70) {
                autoFreq = 100;
                replyText = `Analysis complete. Moderate dirt level (${level}%). Adjusting to ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else {
                autoFreq = 150;
                replyText = `Alert: High dirt level detected (${level}%). Auto-tuning to ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sawtooth');
                setLedState('turbo');
            }
        } else if (currentLang === 'es-ES') {
            if (level < 35) {
                autoFreq = 60;
                replyText = `Análisis completado. Tasa de suciedad baja (${level}%). Vibraciones a ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else if (level < 70) {
                autoFreq = 100;
                replyText = `Análisis completado. Suciedad moderada (${level}%). Ajustando a ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sine');
                setLedState('thinking');
            } else {
                autoFreq = 150;
                replyText = `Alerta: Alta suciedad detectada (${level}%). Iniciando desincrustación a ${autoFreq} Hz.`;
                startOscillator(autoFreq, 'sawtooth');
                setLedState('turbo');
            }
        }
        
        addAlexaMessage(replyText);
        
    }, 1800);
}

// --- Console de Dialogue Alexa Localisée ---

function handleChatSubmit() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    chatInput.value = '';
    
    setLedState('listening');
    setTimeout(() => {
        setLedState('thinking');
        setTimeout(() => {
            processAlexaCommand(text);
        }, 800);
    }, 600);
}

function sendSuggestedMessage(text) {
    chatInput.value = text;
    handleChatSubmit();
}

function processAlexaCommand(text) {
    const cmd = text.toLowerCase();
    let reply = "";
    
    if (currentLang === 'fr-FR') {
        // --- Français ---
        if (cmd.includes('ouvre') || cmd.includes('lance') || cmd.includes('démarrer')) {
            reply = "Bienvenue dans Infraclean, votre système de nettoyage par vibrations sonores. Je suis prête. Dites : calibre pour le bois, lance une détection de saleté, évacue l'eau, améliore l'écoute, ou active le mode turbo. Que souhaitez-vous faire ?";
            setLedState('thinking');
        }
        else if (cmd.includes('écoute') || cmd.includes('micro') || cmd.includes('microphone') || cmd.includes('entendre') || cmd.includes('audition')) {
            reply = "Lancement du cycle d'optimisation d'écoute. Émission d'un balayage acoustique aigu pour déloger la poussière des microphones, suivi d'un calibrage du bruit ambiant. Veuillez ne pas faire de bruit.";
            addAlexaMessage(reply);
            startMicCalibration();
            return;
        }
        else if (cmd.includes('eau') || cmd.includes('expulse') || cmd.includes('évacue') || cmd.includes('vide') || cmd.includes('éjecte')) {
            reply = "Lancement du cycle d'expulsion d'eau. Pulsations sonores à 165 Hertz à amplitude maximale en cours pour évacuer l'humidité.";
            wetDeviceWithWater();
            startWaterEjectionCycle();
        }
        else if (cmd.includes('calibre') || cmd.includes('calibrer') || cmd.includes('ajuste')) {
            if (cmd.includes('bois') || cmd.includes('table') || cmd.includes('bureau')) {
                reply = "Calibrage terminé pour le bois. Fréquence réglée sur 80 Hertz. Début du nettoyage.";
                calibrateForSurface('bois');
            } else if (cmd.includes('verre') || cmd.includes('vitre') || cmd.includes('fenêtre')) {
                reply = "Calibrage terminé pour le verre. Fréquence réglée sur 120 Hertz. Lancement des vibrations.";
                calibrateForSurface('verre');
            } else if (cmd.includes('métal') || cmd.includes('acier') || cmd.includes('fer')) {
                reply = "Calibrage terminé pour le métal. Fréquence réglée sur 160 Hertz. Nettoyage acoustique en cours.";
                calibrateForSurface('métal');
            } else if (cmd.includes('tissu') || cmd.includes('canapé') || cmd.includes('tapis') || cmd.includes('coussin')) {
                reply = "Calibrage terminé pour le tissu. Fréquence basse réglée sur 50 Hertz pour pénétrer les fibres.";
                calibrateForSurface('tissu');
            } else {
                reply = "Pour quelle surface souhaitez-vous calibrer ? Dites bois, verre, métal ou tissu.";
                setLedState('thinking');
            }
        } 
        else if (cmd.includes('détecte') || cmd.includes('détection') || cmd.includes('saleté') || cmd.includes('diagnostic')) {
            reply = "Lancement de la détection de saleté. Veuillez ne pas faire de bruit.";
            addAlexaMessage(reply);
            startDirtDetection();
            return;
        } 
        else if (cmd.includes('turbo') || cmd.includes('puissance maximale') || cmd.includes('tache')) {
            reply = "Mode Turbo activé ! Ondes harmoniques réglées à 200 Hertz à pleine puissance.";
            toggleTurboMode();
            if (!isTurboActive) reply = "Désactivation du mode Turbo. Infraclean revient en veille.";
        } 
        else if (cmd.includes('stop') || cmd.includes('arrête') || cmd.includes('coupe') || cmd.includes('désactive')) {
            reply = "Arrêt immédiat des ondes acoustiques. Infraclean passe en veille.";
            stopWaterEjectionAudio();
            stopMicCalibrationAudio();
            stopOscillator();
            resetActiveStates();
            setLedState('idle');
        } 
        else if (cmd.includes('aide') || cmd.includes('aide-moi') || cmd.includes('comment')) {
            reply = "Je peux calibrer les vibrations pour différentes surfaces. Dites par exemple : 'Calibre pour le bois', 'Évacue l'eau', 'Améliore l'écoute' ou 'Mode Turbo'.";
            setLedState('thinking');
        } 
        else {
            reply = "Désolée, je n'ai pas compris la commande. Vous pouvez me demander de calibrer une surface, d'éjecter l'eau, d'optimiser l'écoute, de lancer un diagnostic, ou d'arrêter.";
            setLedState('thinking');
        }
    } 
    else if (currentLang === 'en-US') {
        // --- English ---
        if (cmd.includes('open') || cmd.includes('launch') || cmd.includes('start')) {
            reply = "Welcome to Infraclean, your low-frequency vibrational cleaning system. I am ready. Say: calibrate for wood, start dirt detection, eject water, improve listening, or activate turbo mode. What would you like to do?";
            setLedState('thinking');
        }
        else if (cmd.includes('listen') || cmd.includes('listening') || cmd.includes('mic') || cmd.includes('microphone') || cmd.includes('hear')) {
            reply = "Starting listening optimization cycle. Emitting a high-frequency sweep to clear microphone ports, followed by ambient noise threshold calibration. Please remain quiet.";
            addAlexaMessage(reply);
            startMicCalibration();
            return;
        }
        else if (cmd.includes('water') || cmd.includes('eject') || cmd.includes('clear') || cmd.includes('remove') || cmd.includes('push')) {
            reply = "Starting water ejection cycle. Low-frequency sound pulses at 165 Hertz active to push moisture out.";
            wetDeviceWithWater();
            startWaterEjectionCycle();
        }
        else if (cmd.includes('calibrate') || cmd.includes('adjust') || cmd.includes('tune')) {
            if (cmd.includes('wood') || cmd.includes('table') || cmd.includes('desk')) {
                reply = "Calibration completed for wood. Frequency set to 80 Hertz. Starting cleaning.";
                calibrateForSurface('bois');
            } else if (cmd.includes('glass') || cmd.includes('window') || cmd.includes('mirror')) {
                reply = "Calibration completed for glass. Frequency set to 120 Hertz. Initiating vibrations.";
                calibrateForSurface('verre');
            } else if (cmd.includes('metal') || cmd.includes('steel') || cmd.includes('iron')) {
                reply = "Calibration completed for metal. Frequency set to 160 Hertz. Acoustic cleaning in progress.";
                calibrateForSurface('métal');
            } else if (cmd.includes('fabric') || cmd.includes('couch') || cmd.includes('sofa') || cmd.includes('carpet')) {
                reply = "Calibration completed for fabric. Low frequency set to 50 Hertz to penetrate fibers.";
                calibrateForSurface('tissu');
            } else {
                reply = "Which surface would you like to calibrate? Say wood, glass, metal, or fabric.";
                setLedState('thinking');
            }
        } 
        else if (cmd.includes('detect') || cmd.includes('detection') || cmd.includes('dirt') || cmd.includes('scan') || cmd.includes('dust')) {
            reply = "Starting dirt detection. Please remain quiet.";
            addAlexaMessage(reply);
            startDirtDetection();
            return;
        } 
        else if (cmd.includes('turbo') || cmd.includes('max power') || cmd.includes('stain')) {
            reply = "Turbo Mode engaged! Activating harmonic shockwaves at 200 Hertz at full power.";
            toggleTurboMode();
            if (!isTurboActive) reply = "Disengaging Turbo Mode. Infraclean returns to standby.";
        } 
        else if (cmd.includes('stop') || cmd.includes('halt') || cmd.includes('mute') || cmd.includes('turn off')) {
            reply = "Acoustic waves stopped. Infraclean is on standby.";
            stopWaterEjectionAudio();
            stopMicCalibrationAudio();
            stopOscillator();
            resetActiveStates();
            setLedState('idle');
        } 
        else if (cmd.includes('help') || cmd.includes('guide') || cmd.includes('how')) {
            reply = "I can calibrate vibrations for different surfaces. Say: 'Calibrate for wood', 'Eject water', 'Improve listening', or 'Activate Turbo Mode'.";
            setLedState('thinking');
        } 
        else {
            reply = "Sorry, I didn't catch that. You can ask me to calibrate a surface, eject water, improve listening, run a dirt diagnosis, or stop.";
            setLedState('thinking');
        }
    } 
    else if (currentLang === 'es-ES') {
        // --- Español ---
        if (cmd.includes('abre') || cmd.includes('inicia') || cmd.includes('arranca') || cmd.includes('abrir')) {
            reply = "Bienvenido a Infraclean, tu sistema de limpieza por vibración sonora. Estoy lista. Di: calibra para madera, inicia la detección de suciedad, expulsa el agua, mejora la escucha, o activa el modo turbo. ¿Qué deseas hacer?";
            setLedState('thinking');
        }
        else if (cmd.includes('escucha') || cmd.includes('micro') || cmd.includes('micrófono') || cmd.includes('oír') || cmd.includes('audición')) {
            reply = "Iniciando ciclo de optimización de escucha. Emitiendo un barrido acústico agudo para limpiar los micrófonos de polvo, seguido de una calibración del ruido ambiental. Por favor, guarde silencio.";
            addAlexaMessage(reply);
            startMicCalibration();
            return;
        }
        else if (cmd.includes('agua') || cmd.includes('expulsa') || cmd.includes('evacuar') || cmd.includes('saca') || cmd.includes('sacar')) {
            reply = "Iniciando el ciclo de expulsión de agua. Pulsaciones sonoras a 165 Hertz a máxima potencia en curso para evacuar la humedad.";
            wetDeviceWithWater();
            startWaterEjectionCycle();
        }
        else if (cmd.includes('calibra') || cmd.includes('calibrar') || cmd.includes('ajusta') || cmd.includes('ajustar')) {
            if (cmd.includes('madera') || cmd.includes('mesa') || cmd.includes('escritorio')) {
                reply = "Calibración realizada para madera. Frecuencia definida en 80 Hertz. Iniciando limpieza.";
                calibrateForSurface('bois');
            } else if (cmd.includes('vidrio') || cmd.includes('cristal') || cmd.includes('ventana') || cmd.includes('espejo')) {
                reply = "Calibración realizada para vidrio. Frecuencia definida en 120 Hertz. Iniciando vibraciones.";
                calibrateForSurface('verre');
            } else if (cmd.includes('metal') || cmd.includes('acero') || cmd.includes('hierro')) {
                reply = "Calibración realizada para metal. Frecuencia definida en 160 Hertz. Limpieza acústica en curso.";
                calibrateForSurface('métal');
            } else if (cmd.includes('tejido') || cmd.includes('sofá') || cmd.includes('alfombra') || cmd.includes('tela')) {
                reply = "Calibración realizada para tejido. Frecuencia baja de 50 Hertz para penetrar las fibras.";
                calibrateForSurface('tissu');
            } else {
                reply = "¿Para qué superficie deseas calibrar? Di madera, vidrio, metal o tejido.";
                setLedState('thinking');
            }
        } 
        else if (cmd.includes('detecta') || cmd.includes('detección') || cmd.includes('suciedad') || cmd.includes('polvo') || cmd.includes('diagnóstico')) {
            reply = "Iniciando detección de suciedad. Por favor, no haga ruido.";
            addAlexaMessage(reply);
            startDirtDetection();
            return;
        } 
        else if (cmd.includes('turbo') || cmd.includes('potencia máxima') || cmd.includes('mancha')) {
            reply = "¡Modo Turbo activado! Ondas armónicas ajustadas a 200 Hertz a máxima potencia.";
            toggleTurboMode();
            if (!isTurboActive) reply = "Desactivando modo Turbo. Infraclean vuelve a espera.";
        } 
        else if (cmd.includes('stop') || cmd.includes('para') || cmd.includes('detén') || cmd.includes('desactiva')) {
            reply = "Ondas acústicas detenidas. Infraclean se encuentra en espera.";
            stopWaterEjectionAudio();
            stopMicCalibrationAudio();
            stopOscillator();
            resetActiveStates();
            setLedState('idle');
        } 
        else if (cmd.includes('ayuda') || cmd.includes('cómo') || cmd.includes('ayúdame')) {
            reply = "Puedo calibrar las vibraciones para diferentes superficies. Di: 'Calibra para madera', 'Expulsa el agua', 'Mejorar escucha' o 'Activa el modo Turbo'.";
            setLedState('thinking');
        } 
        else {
            reply = "Lo siento, no he entendido el comando. Puedes pedirme calibrar una superficie, expulsar el agua, mejorar la escucha, detectar la suciedad o parar.";
            setLedState('thinking');
        }
    }
    
    addAlexaMessage(reply);
}

function addUserMessage(text) {
    const time = new Date().toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const msg = `
        <div class="message user">
            <div class="message-sender">${currentLang === 'fr-FR' ? 'Vous' : currentLang === 'en-US' ? 'You' : 'Tú'}</div>
            <div class="message-text">${escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addAlexaMessage(text) {
    const time = new Date().toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const msg = `
        <div class="message alexa">
            <div class="message-sender">Alexa</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    if ('speechSynthesis' in window && isAudioPlaying) {
        const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
        utterance.lang = currentLang;
        utterance.rate = 1.05;
        
        if (gainNode) {
            const oldGain = gainNode.gain.value;
            gainNode.gain.setValueAtTime(oldGain * 0.15, audioCtx.currentTime);
            utterance.onend = () => {
                gainNode.gain.setValueAtTime(oldGain, audioCtx.currentTime);
            };
        }
        window.speechSynthesis.speak(utterance);
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- Tabs & Affichage Code Développeur ---

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(c => c.classList.remove('active'));
            
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function copyCode(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector(`#${elementId}`).parentElement.previousElementSibling;
        const oldText = btn.innerHTML;
        
        const t = UI_TRANSLATIONS[currentLang];
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ${t.copiedBtnText}`;
        setTimeout(() => {
            btn.innerHTML = oldText;
        }, 1500);
    });
}

function loadSourceCodes() {
    let modelFile = 'alexa-skill/models/fr-FR.json';
    if (currentLang === 'en-US') modelFile = 'alexa-skill/models/en-US.json';
    else if (currentLang === 'es-ES') modelFile = 'alexa-skill/models/es-ES.json';
    
    fetch(modelFile)
        .then(res => res.text())
        .then(code => document.getElementById('code-model').textContent = code)
        .catch(() => loadFallbackCode('code-model'));

    fetch('alexa-skill/lambda/index.js')
        .then(res => res.text())
        .then(code => document.getElementById('code-lambda').textContent = code)
        .catch(() => loadFallbackCode('code-lambda'));

    fetch('alexa-skill/skill.json')
        .then(res => res.text())
        .then(code => document.getElementById('code-manifest').textContent = code)
        .catch(() => loadFallbackCode('code-manifest'));

    fetch('README.md')
        .then(res => res.text())
        .then(code => document.getElementById('code-readme').innerText = code)
        .catch(() => loadFallbackCode('code-readme'));
}

function loadFallbackCode(elementId) {
    let fallback = "";
    if (elementId === 'code-model') {
        if (currentLang === 'fr-FR') {
            fallback = `// Modèle d'interaction vocal - Français
{ "interactionModel": { "languageModel": { "invocationName": "infraclean" } } }`;
        } else if (currentLang === 'en-US') {
            fallback = `// Interaction Model - English
{ "interactionModel": { "languageModel": { "invocationName": "infraclean" } } }`;
        } else {
            fallback = `// Modelo de interacción - Español
{ "interactionModel": { "languageModel": { "invocationName": "infraclean" } } }`;
        }
    } else if (elementId === 'code-lambda') {
        fallback = `// Lambda code handler localization...`;
    } else if (elementId === 'code-manifest') {
        fallback = `{ "manifest": { "publishingInformation": { "locales": { "fr-FR": {}, "en-US": {}, "es-ES": {} } } } }`;
    } else if (elementId === 'code-readme') {
        fallback = "Consultez le fichier README.md dans le dossier du projet.";
    }
    
    document.getElementById(elementId).innerText = fallback;
}
