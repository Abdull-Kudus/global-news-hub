// Global Variables
let currentUser = null;
let apiKey = null;
let allArticles = [];
let savedArticles = [];
let cache = {};

// Cache Configuration (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// ===== INITIALIZATION =====
window.onload = function() {
    checkAuth();
    loadSavedArticles();
};

// ===== AUTHENTICATION FUNCTIONS =====
function checkAuth() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('currentUser').textContent = currentUser.username;
    
    // Check for API key
    const storedApiKey = localStorage.getItem('newsApiKey_' + currentUser.username);
    if (storedApiKey) {
        apiKey = storedApiKey;
        document.getElementById('apiKeySetup').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        loadTopHeadlines();
    } else {
        document.getElementById('apiKeySetup').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    }
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    clearAuthError();
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    clearAuthError();
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showAuthError('Please enter both username and password');
        return;
    }