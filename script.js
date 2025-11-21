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
            'https://washington-post.p.rapidapi.com/categories',   
            {
                 method: 'GET',
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': 'washington-post.p.rapidapi.com',
                    'Accept': 'application/json'
                }
            }
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
            const errorData = await response.json().catch(() => ({}));
            alert('Invalid API key. Please check and try again.');
        }
    } catch (error) {
        hideLoading();
        alert('Error testing API key: ' + error.message);
    }
}

// ===== CACHING SYSTEM =====
function getCacheKey(url) {
    return 'cache_' + url;
}

function getCachedData(url) {
    const cacheKey = getCacheKey(url);
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - data.timestamp < CACHE_DURATION) {
            console.log('Using cached data for:', url);
            updateCacheStatus('Cached ✓');
            return data.content;
        } else {
            // Cache expired
            localStorage.removeItem(cacheKey);
        }
    }
    
    return null;
}

function setCachedData(url, content) {
    const cacheKey = getCacheKey(url);
    const data = {
        timestamp: Date.now(),
        content: content
    };
    
    try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('Data cached for:', url);
    } catch (e) {
        // Storage full, clear old caches
        clearOldCaches();
    }
}

function clearOldCaches() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    // Remove oldest caches first
    cacheKeys.forEach(key => {
        try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Date.now() - data.timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
        }
        } catch (e) {
            localStorage.removeItem(key);
        }
    });
}

function updateCacheStatus(status) {
    document.getElementById('cacheStatus').textContent = status;
}

// ===== NEWS API FUNCTIONS =====
async function fetchNews(url) {
    try {
        // Check cache first
        const cachedData = getCachedData(url);
        if (cachedData) {
            return cachedData;
        }

        updateCacheStatus('Fetching...');
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || 'API Error');
        }

        // Cache the response
        setCachedData(url, data);
        updateCacheStatus('Active ✓');

        return data;
    } catch (error) {
        throw new Error('Failed to fetch news: ' + error.message);
    }
}

async function loadTopHeadlines() {
    const country = document.getElementById('countryFilter').value;
    const category = document.getElementById('categoryFilter').value;
    
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=50&apiKey=${apiKey}`;
    
    if (category !== 'all') {
        url += `&category=${category}`;
    }

    try {
        showLoading();
        hideError();
        
        const data = await fetchNews(url);
        allArticles = data.articles || [];
        displayArticles(allArticles);
        updateStats();
        updateLastUpdate();
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function searchNews() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showError('Please enter a search term');
        return;
    }

    const sortBy = document.getElementById('sortFilter').value;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&pageSize=50&apiKey=${apiKey}`;

    try {
        showLoading();
        hideError();
        
        const data = await fetchNews(url);
        allArticles = data.articles || [];
        displayArticles(allArticles);
        updateStats();
        updateLastUpdate();
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function applyFilters() {
    // Reload with new filters
    const searchQuery = document.getElementById('searchInput').value.trim();
    
    if (searchQuery) {
        searchNews();
    } else {
        loadTopHeadlines();
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayArticles(articles) {
    const grid = document.getElementById('articlesGrid');
    const emptyState = document.getElementById('emptyState');

    if (!articles || articles.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Filter out articles without titles or images
    const validArticles = articles.filter(article => 
        article.title && 
        article.title !== '[Removed]' && 
        article.description
    );

    grid.innerHTML = validArticles.map(article => createArticleCard(article)).join('');
}

function createArticleCard(article) {
    const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
    const source = article.source.name || 'Unknown Source';
    const title = article.title || 'No Title';
    const description = article.description || 'No description available';
    const publishedAt = new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const isSaved = savedArticles.some(saved => saved.url === article.url);
    const saveButtonText = isSaved ? '✓ Saved' : '💾 Save';
    const saveButtonClass = isSaved ? 'btn-save' : 'btn-save';

    return `
        <div class="article-card">
            <img src="${imageUrl}" alt="${title}" class="article-image" 
                 onerror="this.src='https://via.placeholder.com/400x200?text=Image+Unavailable'">
            <div class="article-content">
                <div class="article-source">${source}</div>
                <h3 class="article-title">${title}</h3>
                <p class="article-description">${description.substring(0, 150)}...</p>
                <div class="article-meta">
                    <span class="article-date">${publishedAt}</span>
                    <div class="article-actions">
                        <button class="${saveButtonClass}" onclick='saveArticle(${JSON.stringify(article).replace(/'/g, "&apos;")})'>${saveButtonText}</button>
                        <a href="${article.url}" target="_blank" class="btn-read">Read More</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateStats() {
    document.getElementById('totalArticles').textContent = allArticles.length;
    document.getElementById('savedArticles').textContent = savedArticles.length;
    
    const uniqueSources = new Set(allArticles.map(a => a.source.name)).size;
    document.getElementById('totalSources').textContent = uniqueSources;
}

function updateLastUpdate() {
    const now = new Date().toLocaleString();
    document.getElementById('lastUpdate').textContent = now;
}

// ===== SAVED ARTICLES =====
function loadSavedArticles() {
    if (currentUser) {
        const key = 'savedArticles_' + currentUser.username;
        savedArticles = JSON.parse(localStorage.getItem(key) || '[]');
    }
}

function saveArticle(article) {
    const exists = savedArticles.some(saved => saved.url === article.url);
    
    if (exists) {
        alert('Article already saved!');
        return;
    }

    savedArticles.push({
        ...article,
        savedAt: new Date().toISOString()
    });

    const key = 'savedArticles_' + currentUser.username;
    localStorage.setItem(key, JSON.stringify(savedArticles));
    
    updateStats();
    displayArticles(allArticles); // Refresh to update button states
    
    alert('Article saved successfully!');
}

// ===== UI STATE FUNCTIONS =====
function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('articlesGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('articlesGrid').classList.remove('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('errorState');
    errorDiv.textContent = '⚠️ ' + message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorState').classList.add('hidden');
}

// ===== DEMO ACCOUNT SETUP =====
(function setupDemoAccount() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users['demo']) {
        users['demo'] = {
            email: 'demo@example.com',
            password: 'demo123',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
})();
