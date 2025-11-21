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
async function fetchNews(url, headers) {
    try {
        // Check cache first
        const cachedData = getCachedData(url);
        if (cachedData) {
            return cachedData;
        }

        updateCacheStatus('Fetching...');
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Cache the response
        setCachedData(url, data);
        updateCacheStatus('Active ✓');

        return data;
    } catch (error) {
        throw new Error('Failed to fetch news: ' + error.message);
    }
}

async function loadTopHeadlines() {
    const category = document.getElementById('categoryFilter').value;
    const url = `https://washington-post.p.rapidapi.com/news/${category}?page=1`;
    
    const headers = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'washington-post.p.rapidapi.com',
        'Accept': 'application/json'
    };

    try {
        showLoading();
        hideError();
        
        const data = await fetchNews(url, headers);
        
        // Check if data has results
        if (!data.results || data.results.length === 0) {
            showError('No articles found for this category');
            allArticles = [];
            displayArticles(allArticles);
            return;
        }
        
        // Transform Washington Post format to our format
        allArticles = data.results.map(article => ({
            id: article.id,
            title: article.title || 'No Title',
            description: article.description || 'No description available',
            url: article.url,
            urlToImage: article.thumbnail,
            audio: article.audio,
            publishedAt: article.published,
            source: { name: 'Washington Post' }
        }));
        
        displayArticles(allArticles);
        updateStats();
        updateLastUpdate();
        updateCurrentCategory();
        
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

    // For search, we'll get current category and filter locally
    const category = document.getElementById('categoryFilter').value;
    const url = `https://washington-post.p.rapidapi.com/news/${category}?page=1`;
    
    const headers = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'washington-post.p.rapidapi.com',
        'Accept': 'application/json'
    };

    try {
        showLoading();
        hideError();
        
        const data = await fetchNews(url, headers);
        
        if (!data.results || data.results.length === 0) {
            allArticles = [];
        } else {
            // Transform data
            allArticles = data.results.map(article => ({
                id: article.id,
                title: article.title || 'No Title',
                description: article.description || 'No description available',
                url: article.url,
                urlToImage: article.thumbnail,
                audio: article.audio,
                publishedAt: article.published,
                source: { name: 'Washington Post' }
            }));
        }
        
        // Filter by search query (case-insensitive)
        const queryLower = query.toLowerCase();
        const filtered = allArticles.filter(article => 
            (article.title && article.title.toLowerCase().includes(queryLower)) ||
            (article.description && article.description.toLowerCase().includes(queryLower))
        );
        
        if (filtered.length === 0) {
            showError(`No articles found matching "${query}". Try a different search term.`);
        }
        
        displayArticles(filtered);
        updateStats();
        updateLastUpdate();
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function applyFilters() {
    // Clear search input when changing filters
    document.getElementById('searchInput').value = '';
    
    // Reload with new category
    loadTopHeadlines();
}

function sortArticles() {
    const sortBy = document.getElementById('sortFilter').value;
    
    let sortedArticles = [...allArticles];
    
    if (sortBy === 'publishedAt') {
        sortedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'title') {
        sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    displayArticles(sortedArticles);
}

function updateCurrentCategory() {
    const category = document.getElementById('categoryFilter').value;
    const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('currentCategory').textContent = categoryDisplay;
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

    grid.innerHTML = articles.map(article => createArticleCard(article)).join('');
}

function createArticleCard(article) {
    const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=Washington+Post';
    const title = article.title || 'No Title';
    const description = article.description || 'No description available';
    const publishedAt = new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isSaved = savedArticles.some(saved => saved.url === article.url);
    const saveButtonText = isSaved ? '✓ Saved' : '💾 Save';

    // Escape quotes in JSON for onclick
    const articleJson = JSON.stringify(article).replace(/"/g, '&quot;');

    return `
        <div class="article-card">
            <img src="${imageUrl}" alt="${title}" class="article-image" 
                 onerror="this.src='https://via.placeholder.com/400x200?text=Image+Unavailable'">
            <div class="article-content">
                <div class="article-source">Washington Post</div>
                <h3 class="article-title">${title}</h3>
                <p class="article-description">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
                <div class="article-meta">
                    <span class="article-date">📅 ${publishedAt}</span>
                    <div class="article-actions">
                        <button class="btn-save" onclick='saveArticle(${articleJson})'>${saveButtonText}</button>
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
}

function updateLastUpdate() {
    const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
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