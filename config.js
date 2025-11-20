// Configuration File
// DO NOT COMMIT THIS FILE TO GITHUB IF IT CONTAINS REAL API KEYS

const CONFIG = {
    // Application Settings
    APP_NAME: 'Global News Hub',
    VERSION: '1.0.0',
    
    // API Configuration
    API_BASE_URL: 'https://newsapi.org/v2',
    
    // Cache Settings (in milliseconds)
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    
    // Default Settings
    DEFAULT_COUNTRY: 'us',
    DEFAULT_CATEGORY: 'all',
    DEFAULT_PAGE_SIZE: 50,
    
    // Available Countries
    COUNTRIES: {
        'us': 'United States',
        'gb': 'United Kingdom',
        'ca': 'Canada',
        'au': 'Australia',
        'in': 'India',
        'de': 'Germany',
        'fr': 'France',
        'it': 'Italy',
        'jp': 'Japan',
        'cn': 'China',
        'rw': 'Rwanda'
    },
    
    // Available Categories
    CATEGORIES: [
        'business',
        'entertainment',
        'general',
        'health',
        'science',
        'sports',
        'technology'
    ],
    
    // Sort Options
    SORT_OPTIONS: {
        'publishedAt': 'Latest First',
        'relevancy': 'Most Relevant',
        'popularity': 'Most Popular'
    },
    
    // Feature Flags
    FEATURES: {
        enableUserAuth: true,
        enableCaching: true,
        enableSavedArticles: true,
        enableFiltering: true,
        enableSorting: true,
        enableSearch: true
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        noApiKey: 'Please configure your API key first',
        apiError: 'Failed to fetch news. Please try again.',
        networkError: 'Network error. Please check your connection.',
        invalidKey: 'Invalid API key. Please check your credentials.',
        rateLimitExceeded: 'API rate limit exceeded. Please try again later.',
        noResults: 'No articles found. Try different search terms.',
        invalidInput: 'Please enter valid search terms.'
    },
    
    // Success Messages
    SUCCESS_MESSAGES: {
        articleSaved: 'Article saved successfully!',
        loginSuccess: 'Welcome back!',
        registerSuccess: 'Account created successfully!',
        apiKeySet: 'API key configured successfully!'
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        users: 'users',
        currentUser: 'currentUser',
        apiKeyPrefix: 'newsApiKey_',
        savedArticlesPrefix: 'savedArticles_',
        cachePrefix: 'cache_'
    }
};

// Helper Functions
const ConfigHelper = {
    getApiKey: function(username) {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.apiKeyPrefix + username);
    },
    
    setApiKey: function(username, key) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.apiKeyPrefix + username, key);
    },
    
    isFeatureEnabled: function(feature) {
        return CONFIG.FEATURES[feature] === true;
    },
    
    getErrorMessage: function(errorType) {
        return CONFIG.ERROR_MESSAGES[errorType] || 'An error occurred';
    },
    
    getSuccessMessage: function(successType) {
        return CONFIG.SUCCESS_MESSAGES[successType] || 'Operation successful';
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigHelper };
}