/* VisionSnap AI - Bundled Script */

// --- AI Service ---
const CATEGORIES = {
    GENERAL: 'general',
    FOOD: 'food',
    PLANT: 'plant'
};

const MOCK_RESULTS = {
    [CATEGORIES.GENERAL]: [
        { name: 'Wireless Headphones', status: 'safe', label: 'Electronic', desc: 'A pair of over-ear wireless headphones with noise cancellation.', details: { 'Brand': 'Generic', 'Battery': '24h' } },
        { name: 'Ceramic Mug', status: 'safe', label: 'Kitchenware', desc: 'White ceramic mug, standard 12oz size.', details: { 'Material': 'Ceramic', 'Microwave': 'Safe' } },
        { name: 'Laptop', status: 'safe', label: 'Electronic', desc: 'High-performance laptop suitable for development.', details: { 'OS': 'Windows', 'RAM': '16GB' } }
    ],
    [CATEGORIES.FOOD]: [
        { name: 'Red Apple', status: 'safe', label: 'Fruit', desc: 'Fresh red apple, rich in fiber and vitamin C.', details: { 'Calories': '95', 'Sugar': '19g' } },
        { name: 'Pepperoni Pizza', status: 'warning', label: 'Fast Food', desc: 'Slice of pepperoni pizza. High in sodium and saturated fats.', details: { 'Calories': '250', 'Fat': '12g' } },
        { name: 'Avocado Toast', status: 'safe', label: 'Breakfast', desc: 'Toasted bread topped with mashed avocado.', details: { 'Calories': '350', 'Protein': '8g' } }
    ],
    [CATEGORIES.PLANT]: [
        { name: 'Snake Plant', status: 'safe', label: 'Indoor Plant', desc: 'Sansevieria trifasciata. Excellent air purifier, low maintenance.', details: { 'Light': 'Low-Bright', 'Water': 'Low' } },
        { name: 'Monstera', status: 'warning', label: 'Tropical', desc: 'Monstera deliciosa. Toxic to pets if ingested.', details: { 'Toxicity': 'High (Pets)', 'Growth': 'Fast' } },
        { name: 'Aloe Vera', status: 'safe', label: 'Succulent', desc: 'Medicinal plant known for soothing skin.', details: { 'Care': 'Easy', 'Water': 'Moderate' } }
    ]
};

async function analyzeImage(imageBlob, category) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const options = MOCK_RESULTS[category] || MOCK_RESULTS[CATEGORIES.GENERAL];
            const result = options[Math.floor(Math.random() * options.length)];
            resolve({
                ...result,
                timestamp: new Date().toISOString(),
                imageUrl: URL.createObjectURL(imageBlob)
            });
        }, 1500);
    });
}

// --- Camera Manager ---
class CameraManager {
    constructor(videoElement, onCapture) {
        this.video = videoElement;
        this.stream = null;
        this.onCapture = onCapture;
        this.facingMode = 'environment';
    }

    async start() {
        if (this.stream) return;
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.facingMode }
            });
            this.video.srcObject = this.stream;
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access denied or unavailable. Please use upload.");
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
        }
    }

    switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        this.stop();
        this.start();
    }

    capture() {
        if (!this.stream) return;
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);
        canvas.toBlob((blob) => {
            if (this.onCapture) this.onCapture(blob);
        }, 'image/jpeg', 0.9);
    }
}

// --- UI Helpers ---
function renderResult(result, container) {
    const statusClass = result.status === 'safe' ? 'status-safe' :
        result.status === 'danger' ? 'status-danger' : 'status-warning';

    const detailsHtml = Object.entries(result.details).map(([key, value]) => `
        <div class="info-item">
            <h4>${key}</h4>
            <p>${value}</p>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="result-card">
            <img src="${result.imageUrl}" class="result-img" alt="Scanned Image">
            <div class="result-body">
                <div class="result-title-row">
                    <div>
                        <h2 class="result-name">${result.name}</h2>
                        <p class="result-category">${result.label}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${result.status.toUpperCase()}</span>
                </div>
                <p class="description">${result.desc}</p>
                <div class="info-grid">
                    ${detailsHtml}
                </div>
            </div>
        </div>
    `;
}

function renderHistory(historyItems, container) {
    if (historyItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:40px;">No scans yet.</p>';
        return;
    }
    container.innerHTML = historyItems.map(item => `
        <div class="history-item" style="display:flex; gap:10px; background:white; padding:10px; border-radius:12px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="width:60px; height:60px; border-radius:8px; overflow:hidden; background:#eee;">
                 <img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div>
                <h4 style="font-size:16px; margin-bottom:4px;">${item.name}</h4>
                <p style="font-size:12px; color:#888;">${new Date(item.timestamp).toLocaleDateString()}</p>
                <span style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px;">${item.label}</span>
            </div>
        </div>
    `).join('');
}

// --- Main App Logic ---
let currentCategory = CATEGORIES.GENERAL;
let scanHistory = [];
let cameraManager = null;

const views = {
    home: document.getElementById('view-home'),
    camera: document.getElementById('view-camera'),
    result: document.getElementById('view-result'),
    history: document.getElementById('view-history'),
    profile: document.getElementById('view-profile')
};

const navItems = document.querySelectorAll('.nav-item');
const categoryTabs = document.querySelectorAll('.cat-tab');
const cameraFeed = document.getElementById('camera-feed');
const resultContent = document.getElementById('result-content');

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.remove('active'));

    const targetId = viewName.startsWith('view-') ? viewName : `view-${viewName}`;
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');

    navItems.forEach(item => {
        if (item.dataset.target === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (targetId === 'view-camera') {
        if (!cameraManager) {
            cameraManager = new CameraManager(cameraFeed, handleScan);
        }
        cameraManager.start();
        document.getElementById('bottom-nav').style.display = 'none';
        document.getElementById('app-container').style.backgroundColor = 'black';
    } else {
        if (cameraManager) cameraManager.stop();
        document.getElementById('bottom-nav').style.display = 'flex';
        document.getElementById('app-container').style.backgroundColor = 'var(--bg-color)';
    }

    if (targetId === 'view-history') {
        renderHistory(scanHistory, document.getElementById('history-list'));
    }
}

async function handleScan(blob) {
    switchView('view-result');
    resultContent.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Analyzing ${currentCategory}...</p>
        </div>
    `;

    try {
        const result = await analyzeImage(blob, currentCategory);
        scanHistory.unshift(result);
        renderResult(result, resultContent);
    } catch (error) {
        console.error(error);
        resultContent.innerHTML = '<p style="color:red; text-align:center;">Analysis failed. Please try again.</p>';
    }
}

// Event Listeners
navItems.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.target)));

categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
    });
});

document.getElementById('btn-camera-scan').addEventListener('click', () => switchView('view-camera'));
document.getElementById('btn-upload').addEventListener('click', () => document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleScan(e.target.files[0]);
});
document.getElementById('btn-close-camera').addEventListener('click', () => switchView('view-home'));
document.getElementById('btn-switch-camera').addEventListener('click', () => { if (cameraManager) cameraManager.switchCamera(); });
document.getElementById('btn-capture').addEventListener('click', () => { if (cameraManager) cameraManager.capture(); });
document.querySelector('.back-btn').addEventListener('click', () => switchView('view-home'));

// Init
switchView('home');
