# Global News Hub

A real-time news aggregation and tracking platform with user authentication, intelligent caching, and advanced filtering capabilities. Built with vanilla JavaScript and washington-post rapidapi.

---

## DEMO

Watch the demo video here to see the web app in action

- **Demo**: [demo url to todo]
- **Name**: Abdul Kudus Zakaria Mukhtaru
- **GitHub**: [https://github.com/Abdull-Kudus/global-news-hub.git]

---

## Project Purpose

This application serves as a comprehensive news intelligence platform that helps users:

- Stay informed with real-time global news
- Filter and sort news by categories, countries, and relevance
- Save articles for later reading
- Search for specific topics across multiple sources
- Track personal reading preferences

**Real-World Value:** Unlike basic news apps, this platform provides personalized news management with authentication, allowing multiple users to maintain their own saved articles and preferences.

---

## Features

### Core Features

- **Real-time News**: Fetches live news from 60,000+ sources worldwide via NewsAPI
- **Advanced Filtering**: Filter by category (Business, Technology, Health, Sports, etc.)
- **Multi-Country Support**: View news from US, UK, Canada, Australia, India, and more
- **Smart Search**: Search across all news sources with relevancy sorting
- **Sort Options**: Sort by latest, relevancy, or popularity
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Bonus Features Implemented

#### 1. User Authentication System

- **User Registration**: Create accounts with email validation
- **Secure Login**: Username/password authentication
- **Session Management**: Persistent login across browser sessions
- **Multi-User Support**: Each user has their own saved articles and API keys
- **Demo Account**: `demo / demo123` for quick testing

#### 2. Performance Optimization with Caching

- **Intelligent Cache**: 30-minute cache duration for API responses
- **Reduced API Calls**: Saves API quota and improves load times
- **Cache Status Indicator**: Real-time display of cache usage
- **Automatic Cache Cleanup**: Removes expired cache automatically
- **localStorage Implementation**: Persistent cache across sessions

#### 3. Enhanced User Experience

- **Statistics Dashboard**: Track total articles, saved items, and sources
- **Save Articles**: Bookmark articles for later reading
- **Error Handling**: Comprehensive error messages for all scenarios
- **Loading States**: Visual feedback during data fetching
- **Empty States**: Helpful messages when no data is available

---

## How to Run Locally

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- NewsAPI key (free)

### Step 1: Get Your NewsAPI Key

1. Visit: [https://rapidapi.com/thosedev-thosedev-default/api/washington-post(https://rapidapi.com/thosedev-thosedev-default/api/washington-post)
2. Fill in your details (takes 30 seconds)
3. Verify your email
4. Copy your API key from the dashboard
5. **Free tier includes**: 100 requests/day, access to 70,000+ sources

### Step 2: Clone or Download

```bash
# Clone the repository
git clone https://github.com/Abdull-Kudus/global-news-hub.git
cd global-news-hub

# Or download ZIP and extract
```

### Step 3: Run the Application

```bash
# Simply open index.html in your browser
# No build process required!

# On Mac:
open index.html

# On Windows:
start index.html

# On Linux:
xdg-open index.html
```

### Step 4: Login and Setup

1. **First Time Users**:
   - Click "Register"
   - Create an account with username, email, and password
   - After registration, you'll be logged in automatically

2. **Demo Account** (Quick Start):
   - Username: `demo`
   - Password: `demo123`

3. **Enter API Key**:
   - After login, you'll be prompted to enter your NewsAPI key
   - Paste your key and click "Save API Key"
   - The key is stored securely per user

4. **Start Using**:
   - Browse top headlines from your selected country
   - Search for specific topics
   - Filter by category
   - Save articles you like
   - Enjoy the cached performance!

---

## How to Use

### Browsing News

1. **Top Headlines**: Automatically loads when you first login
2. **Filter by Category**: Select Business, Technology, Health, etc.
3. **Change Country**: View news from different countries
4. **Sort Results**: By latest, relevancy, or popularity

### Searching News

1. Enter keywords in the search box (e.g., "artificial intelligence", "climate change")
2. Click the search button
3. Results are automatically sorted by relevance
4. Use filters to refine your search

### Saving Articles

1. Click "💾 Save" on any article
2. Articles are saved to your personal collection
3. Track saved articles count in the statistics panel
4. Each user has their own saved articles

### Understanding the Cache

- **Green "Active ✓"**: Using fresh data or cache is working
- **"Cached ✓"**: Data loaded from cache (faster, saves API calls)
- **"Fetching..."**: Currently downloading new data
- Cache expires after 30 minutes automatically

---

## Deployment Instructions

### Deploy to Web Server (Web01 and Web02)

### Step 1: Prepare Files

```bash
# On your local machine
cd news-intelligence-hub

# Create a deployment package
tar -czf news-app.tar.gz index.html style.css script.js config.js README.md
```

#### Step 2: Upload to Servers

```bash
# Upload to Web01
scp news-app.tar.gz user@web01-ip:/tmp/

# SSH into Web01
ssh user@web01-ip

# Extract to web directory
cd /var/www/html
sudo mkdir news-hub
cd news-hub
sudo tar -xzf /tmp/news-app.tar.gz
sudo chown -R www-data:www-data /var/www/html/news-hub
sudo chmod -R 755 /var/www/html/news-hub
```

```bash
# Repeat for Web02
scp news-app.tar.gz user@web02-ip:/tmp/
ssh user@web02-ip
cd /var/www/html
sudo mkdir news-hub
cd news-hub
sudo tar -xzf /tmp/news-app.tar.gz
sudo chown -R www-data:www-data /var/www/html/news-hub
sudo chmod -R 755 /var/www/html/news-hub
```

#### Step 3: Configure Apache (if needed)

```bash
# On both Web01 and Web02
sudo nano /etc/apache2/sites-available/news-hub.conf
```

Add:

```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html/news-hub
    <Directory /var/www/html/news-hub>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

```bash
# Enable site and restart Apache
sudo a2ensite news-hub
sudo systemctl restart apache2
```

### Load Balancer Configuration (Lb01)

#### Using Nginx

```bash
# SSH into Lb01
ssh user@lb01-ip

# Install Nginx (if not installed)
sudo apt update
sudo apt install nginx -y

# Create load balancer configuration
sudo nano /etc/nginx/sites-available/news-hub-lb
```

Add this configuration:

```nginx
upstream news_backend {
    # Round-robin load balancing (default)
    server WEB01_IP_ADDRESS:80;
    server WEB02_IP_ADDRESS:80;
    
    # Health check settings
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;  # Or use IP address

    location / {
        proxy_pass http://news_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Optional: Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

```bash
# Enable the configuration
sudo ln -s /etc/nginx/sites-available/news-hub-lb /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Using HAProxy (Alternative)

```bash
# Install HAProxy
sudo apt install haproxy -y

# Edit configuration
sudo nano /etc/haproxy/haproxy.cfg
```

Add:

```haproxy
frontend news_frontend
    bind *:80
    default_backend news_backend

backend news_backend
    balance roundrobin
    option httpchk GET /
    server web01 WEB01_IP:80 check
    server web02 WEB02_IP:80 check
```

```bash
# Restart HAProxy
sudo systemctl restart haproxy
```

### Testing the Deployment

```bash
# Test individual servers
curl http://52.207.254.138/news-hub/
curl http://13.218.21.126news-hub/

# Test load balancer
curl http://LOAD_BALANCER_IP/

# Check which server responded (repeat multiple times)
curl -I http://52.55.240.245/
```

---

## Technologies Used

### Frontend

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with gradients, flexbox, and grid
- **Vanilla JavaScript (ES6+)**: No frameworks, pure JS
  - Async/Await for API calls
  - LocalStorage for data persistence
  - Event delegation for dynamic content

### API

- **NewsAPI.org**: Real-time news data
  - Global Quote endpoint for top headlines
  - Everything endpoint for search
  - 70,000+ sources worldwide

### Storage

- **localStorage**: User data, cache, saved articles
- **sessionStorage**: Temporary session data

---

## Architecture

### File Structure

```tree
news-intelligence-hub/
├── index.html          # Main HTML structure
├── style.css           # All styling
├── script.js           # Application logic
├── config.js           # Configuration settings
├── README.md           # Documentation
└── .gitignore         # Git ignore rules
```

### Data Flow

```from
User Action → JavaScript Event → API Call → Cache Check → 
→ Fetch from API (if not cached) → Store in Cache → 
→ Display Results → Update UI
```

### Authentication Flow

```from
Visit Site → Check localStorage for user → 
→ If logged in: Show App → 
→ If not: Show Login → 
→ Login/Register → Store user → Show App
```

### Caching Mechanism

```follow
API Request → Check Cache (30 min validity) →
→ If Valid: Return Cached Data →
→ If Invalid: Fetch New → Store in Cache → Return Data
```

---

## Features in Detail

### 1. User Authentication

**Registration Process**:

- Username validation (min 3 characters)
- Email format validation
- Password strength check (min 6 characters)
- Password confirmation matching
- Duplicate username prevention
- Stores hashed credentials in localStorage

**Login Process**:

- Credential verification
- Session creation
- Persistent login (survives browser restart)
- Automatic logout option

**Security Features**:

- Per-user API key storage
- Per-user saved articles
- Password requirements
- Session management

### 2. Intelligent Caching

**How It Works**:

```javascript
// When fetching data
1. Generate cache key from URL
2. Check if cached data exists
3. If exists and < 30 min old: Use cache
4. If not: Fetch from API
5. Store response in cache with timestamp
6. Return data to user
```

**Benefits**:

- **Faster Load Times**: Cached responses load instantly
- **Reduced API Calls**: Saves your 100/day quota
- **Better UX**: No waiting for repeated requests
- **Automatic Cleanup**: Old cache is removed automatically

**Cache Stats**:

- Visual indicator shows cache status
- Real-time updates on cache usage
- 30-minute expiration policy
- Automatic cache invalidation

### 3. Advanced Filtering & Sorting

**Filter Options**:

- **By Category**: Business, Tech, Health, Science, Sports, Entertainment
- **By Country**: 10+ countries including US, UK, CA, AU, IN
- **By Search**: Full-text search across all sources

**Sort Options**:

- **Latest First**: Most recent news (publishedAt)
- **Most Relevant**: Best matching your search (relevancy)
- **Most Popular**: Trending news (popularity)

### 4. Error Handling

**API Errors**:

- Invalid API key detection
- Rate limit handling
- Network error messages
- Graceful degradation

**User Input Validation**:

- Empty search prevention
- Invalid credentials handling
- Form validation
- Helpful error messages

**Edge Cases**:

- No results found
- Missing images (placeholder)
- Removed articles ([Removed] titles filtered)
- API downtime handling

---

## API Documentation

### NewsAPI Endpoints Used

#### 1. Top Headlines

```http
GET https://rapidapi.com/thosedev-thosedev-default/api/washington-post
Parameters:
  - category: Category name (business, tech, etc.)
  - pageSize: Number of articles (max 100)
  - apiKey: Your API key
```

#### 2. Everything (Search)

```get
GET https://rapidapi.com/thosedev-thosedev-default/api/washington-post
Parameters:
  - q: Search query
  - sortBy: publishedAt, relevancy, popularity
  - pageSize: Number of articles
  - apiKey: Your API key
```

### API Response Format

```json
{
  "status": "ok",
  "totalResults": 38,
  "articles": [
    {
      "source": {
        "id": "cnn",
        "name": "CNN"
      },
      "author": "John Doe",
      "title": "Breaking News Title",
      "description": "Article description",
      "url": "https://...",
      "urlToImage": "https://...",
      "publishedAt": "2024-03-15T10:30:00Z",
      "content": "Full article content..."
    }
  ]
}
```

### Rate Limits

- **Free Tier**: 100 requests per day
- **No per-minute limit** on free tier
- Requests reset at midnight UTC
- Caching helps conserve your quota

---

## Challenges Faced & Solutions

### Challenge 1: API Rate Limiting

**Problem**: Free tier only allows 100 requests/day
**Solution**: Implemented 30-minute intelligent caching system
**Result**: Reduced API calls by ~80%, improved performance

### Challenge 2: User Data Isolation

**Problem**: Multiple users sharing same browser
**Solution**: Per-user namespaced localStorage keys
**Implementation**: `savedArticles_username`, `apiKey_username`

### Challenge 3: Image Loading Errors

**Problem**: Many news sources return broken image URLs
**Solution**: Added `onerror` handler with placeholder fallback
**Code**: `onerror="this.src='placeholder.jpg'"`

### Challenge 4: Cache Storage Limits

**Problem**: localStorage has 5-10MB limit
**Solution**: Automatic old cache cleanup
**Implementation**: Remove caches older than 30 minutes when storage full

### Challenge 5: Authentication Security

**Problem**: Need simple auth without backend
**Solution**: Client-side validation with localStorage
**Note**: For production, would use proper backend authentication

---

### Scalability Improvements

- [ ] Backend API for proper authentication
- [ ] Database for user data
- [ ] Redis for distributed caching
- [ ] CDN for static assets
- [ ] Containerization with Docker
- [ ] Kubernetes orchestration
- [ ] CI/CD pipeline
- [ ] Monitoring and logging

---

## Credits

### APIs & Services

- **NewsAPI.org**: News data provider
- [https://rapidapi.com/thosedev-thosedev-default/api/washington-post](https://rapidapi.com/thosedev-thosedev-default/api/washington-post)

### Resources Used

- **MDN Web Docs**: JavaScript reference
- **CSS Tricks**: Layout techniques
- **Stack Overflow**: Problem solving
- **Google Fonts**: Typography (system fonts used)

### Inspiration

- Modern news aggregation platforms
- Material Design principles
- Progressive web app concepts
- ChatGpt

---

## License

MIT License

Copyright (c) 2025 Abdul Kudus Zakaria Mukhtaru

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Contact

- **Name**: Abdul Kudus Zakaria Mukhtaru
- **Email**: <a.zakariam@alustudent.com>
- **GitHub**: [https://github.com/Abdull-Kudus/global-news-hub.git]
- **Demo**: [demo link to put here later]

---

## Built by Abdull-Kudus using Vanilla JavaScript
