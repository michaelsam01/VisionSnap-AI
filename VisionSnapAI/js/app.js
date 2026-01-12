import { CameraManager } from './camera.js';
import { analyzeImage, CATEGORIES } from './ai.js';
import { renderResult, renderHistory } from './ui.js';

// State
let currentCategory = CATEGORIES.GENERAL;
const HISTORY_KEY = 'visionsnap_history';
let scanHistory = loadHistory();
let cameraManager = null;

function loadHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(scanHistory));
}

// DOM Elements
const views = {
    home: document.getElementById('view-home'),
    camera: document.getElementById('view-camera'),
    result: document.getElementById('view-result'),
    historyFood: document.getElementById('view-history-food'),
    historyPlant: document.getElementById('view-history-plant'),
    profile: document.getElementById('view-profile')
};

const navItems = document.querySelectorAll('.nav-item');
const categoryTabs = document.querySelectorAll('.cat-tab');
const cameraFeed = document.getElementById('camera-feed');
const resultContent = document.getElementById('result-content');

// Navigation Logic
function switchView(viewName) {
    // Hide all views
    Object.values(views).forEach(el => {
        if (el) el.classList.remove('active');
    });

    // Resolve target ID
    const targetId = viewName.startsWith('view-') ? viewName : `view-${viewName}`;
    const target = document.getElementById(targetId);

    // Show target view
    if (target) {
        target.classList.add('active');
    } else {
        console.warn(`View ${targetId} not found`);
        return; // Exit if view doesn't exist to avoid errors
    }

    // Update Bottom Nav state
    navItems.forEach(item => {
        if (item.dataset.target === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Special View Handlers
    handleViewSpecificLogic(targetId);
}

function handleViewSpecificLogic(targetId) {
    // defaults
    if (document.getElementById('bottom-nav')) {
        document.getElementById('bottom-nav').style.display = 'flex';
    }
    if (document.getElementById('app-container')) {
        document.getElementById('app-container').style.backgroundColor = 'var(--bg-color)';
    }

    // Camera View
    if (targetId === 'view-camera') {
        if (!cameraManager) {
            cameraManager = new CameraManager(cameraFeed, handleScan);
        }
        cameraManager.start();
        document.getElementById('bottom-nav').style.display = 'none';
        document.getElementById('app-container').style.backgroundColor = 'black';
    } else {
        // Stop camera if leaving camera view
        if (cameraManager) cameraManager.stop();
    }

    // History Views
    if (targetId === 'view-history-food') {
        const foodHistory = scanHistory.filter(item => item.category === CATEGORIES.FOOD);
        renderHistory(foodHistory, document.getElementById('history-list-food'));
    }

    if (targetId === 'view-history-plant') {
        const plantHistory = scanHistory.filter(item => item.category === CATEGORIES.PLANT);
        renderHistory(plantHistory, document.getElementById('history-list-plant'));
    }
}

// Global Event Listeners
navItems.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.target));
});

categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
    });
});

// Home Page Actions
const btnCamera = document.getElementById('btn-camera-scan');
if (btnCamera) {
    btnCamera.addEventListener('click', () => {
        switchView('view-camera');
    });
}

const btnUpload = document.getElementById('btn-upload');
if (btnUpload) {
    btnUpload.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
}

const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleScan(e.target.files[0]);
        }
    });
}

// Camera Actions
const btnCloseCam = document.getElementById('btn-close-camera');
if (btnCloseCam) btnCloseCam.addEventListener('click', () => switchView('view-home'));

const btnSwitchCam = document.getElementById('btn-switch-camera');
if (btnSwitchCam) {
    btnSwitchCam.addEventListener('click', () => {
        if (cameraManager) cameraManager.switchCamera();
    });
}

const btnFlash = document.getElementById('btn-flash');
if (btnFlash) {
    btnFlash.addEventListener('click', () => {
        if (cameraManager) cameraManager.toggleFlash();
    });
}

const btnCapture = document.getElementById('btn-capture');
if (btnCapture) {
    btnCapture.addEventListener('click', () => {
        if (cameraManager) cameraManager.capture();
    });
}

// Result Page Actions
const btnBack = document.querySelector('.back-btn');
if (btnBack) btnBack.addEventListener('click', () => switchView('view-home'));

// Core Business Logic
async function handleScan(blob) {
    switchView('view-result');
    if (resultContent) {
        resultContent.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Analyzing ${currentCategory}...</p>
            </div>
        `;
    }

    try {
        const result = await analyzeImage(blob, currentCategory);
        result.category = currentCategory;

        // Convert for persistence
        try {
            const base64 = await blobToBase64(blob);
            result.imageUrl = base64;
        } catch (e) {
            console.warn("Image conversion failed", e);
        }

        scanHistory.unshift(result);

        // Limit history size to prevent quota errors
        if (scanHistory.length > 20) scanHistory = scanHistory.slice(0, 20);

        try {
            saveHistory();
        } catch (e) {
            console.warn("Storage quota exceeded");
            // Simple handling: clear old items until it fits or is empty
            while (scanHistory.length > 5) { // Keep at least 5 if possible, else fail
                scanHistory.pop();
                try {
                    saveHistory();
                    break;
                } catch (err) {
                    if (scanHistory.length <= 5) break;
                }
            }
        }

        if (resultContent) renderResult(result, resultContent);
    } catch (error) {
        console.error(error);
        if (resultContent) {
            resultContent.innerHTML = '<p style="color:red; text-align:center;">Analysis failed. Please try again.</p>';
        }
    }
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Initialize App
switchView('home');
