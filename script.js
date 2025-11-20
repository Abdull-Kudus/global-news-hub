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
