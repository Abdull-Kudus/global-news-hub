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

    // Get stored users
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    // Check credentials
    if (users[username] && users[username].password === password) {
        currentUser = {
            username: username,
            email: users[username].email,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        showAuthError('Invalid username or password');
    }
}

function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showAuthError('All fields are required');
        return;
    }

    if (username.length < 3) {
        showAuthError('Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthError('Please enter a valid email');
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        showAuthError('Username already exists');
        return;
    }

    // Create user
    users[username] = {
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    currentUser = {
        username: username,
        email: email,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        apiKey = null;
        allArticles = [];
        showLoginScreen();
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function clearAuthError() {
    document.getElementById('authError').classList.add('hidden');
}

// ===== API KEY MANAGEMENT =====
function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    
    if (!key) {
        alert('Please enter an API key');
        return;
    }

    // Test the API key
    testApiKey(key);
}

async function testApiKey(key) {
    try {
        showLoading();
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${key}`
        );

        if (response.ok) {
            apiKey = key;
            localStorage.setItem('newsApiKey_' + currentUser.username, key);
            document.getElementById('apiKeySetup').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            hideLoading();
            loadTopHeadlines();
        } else {
            hideLoading();
            alert('Invalid API key. Please check and try again.');
        }
    } catch (error) {
        hideLoading();
        alert('Error testing API key: ' + error.message);
    }
}
