/**
 * LocalPro Finder - Core Application
 * Version 2.2.0
 * Features:
 * - Offline-first functionality
 * - Dark/light mode toggle
 * - Geolocation-based sorting
 * - Favorites system
 * - Search and filtering
 * - Ratings system
 */

// ===== CONSTANTS ===== //
const API_ENDPOINT = 'data/services.json';
const CACHE_KEY = 'localpro-data-v2';
const FAVORITES_KEY = 'localpro-favorites';
const RATINGS_KEY = 'localpro-ratings';

// ===== STATE MANAGEMENT ===== //
let appState = {
    services: [],
    filteredServices: [],
    favorites: new Set(),
    ratings: new Map(),
    userLocation: null,
    isLoading: true,
    currentTheme: 'light'
};

// ===== DOM ELEMENTS ===== //
const dom = {
    // Main containers
    listingsGrid: document.getElementById('listingsGrid'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noResults: document.getElementById('noResults'),
    
    // Search/filter elements
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    locationFilter: document.getElementById('locationFilter'),
    sortBy: document.getElementById('sortBy'),
    
    // Theme toggle
    themeToggle: document.getElementById('themeToggle'),
    
    // Toast notification
    toast: document.getElementById('toast'),
    
    // Footer
    currentYear: document.getElementById('currentYear')
};

// ===== INITIALIZATION ===== //
document.addEventListener('DOMContentLoaded', async () => {
    // Set current year in footer
    dom.currentYear.textContent = new Date().getFullYear();
    
    // Load initial data
    await initializeApp();
    
    // Set up event listeners
    setupEventListeners();
});

async function initializeApp() {
    try {
        // Load saved theme preference
        loadThemePreference();
        
        // Load favorites and ratings
        loadFavorites();
        loadRatings();
        
        // Attempt to fetch fresh data
        await fetchServices();
        
        // If no fresh data, try cached version
        if (appState.services.length === 0) {
            await loadCachedServices();
        }
        
        // Initial render
        filterAndRenderServices();
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize application', 'error');
    } finally {
        appState.isLoading = false;
        dom.loadingIndicator.classList.add('hidden');
    }
}

// ===== DATA MANAGEMENT ===== //

async function fetchServices() {
    try {
        const response = await fetch(API_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        appState.services = data;
        
        // Cache the fresh data
        cacheServices(data);
    } catch (error) {
        console.error('Failed to fetch services:', error);
        throw error;
    }
}

async function loadCachedServices() {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
            appState.services = JSON.parse(cachedData);
            showToast('Showing cached data - offline mode', 'info');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to load cached services:', error);
        return false;
    }
}

function cacheServices(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to cache services:', error);
    }
}

// ===== RATINGS SYSTEM ===== //

function loadRatings() {
    try {
        const ratings = localStorage.getItem(RATINGS_KEY);
        if (ratings) {
            appState.ratings = new Map(JSON.parse(ratings));
        }
    } catch (error) {
        console.error('Failed to load ratings:', error);
    }
}

function saveRatings() {
    try {
        localStorage.setItem(RATINGS_KEY, JSON.stringify([...appState.ratings]));
    } catch (error) {
        console.error('Failed to save ratings:', error);
    }
}

function toggleRating(serviceId, rating) {
    if (rating < 1 || rating > 5) return;
    appState.ratings.set(serviceId, rating);
    saveRatings();
    filterAndRenderServices();
    showToast(`Rated service ${rating} stars`, 'success');
}

// ===== RENDERING ===== //

function filterAndRenderServices() {
    // Apply filters
    filterServices();
    
    // Apply sorting
    sortServices();
    
    // Render results
    renderServices();
}

function renderServices() {
    // Clear previous results
    dom.listingsGrid.innerHTML = '';
    
    // Show no results message if empty
    if (appState.filteredServices.length === 0) {
        dom.noResults.classList.remove('hidden');
        return;
    }
    
    dom.noResults.classList.add('hidden');
    
    // Create service cards
    appState.filteredServices.forEach(service => {
        const card = createServiceCard(service);
        dom.listingsGrid.appendChild(card);
    });
}

function createServiceCard(service) {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.dataset.id = service.id;
    card.dataset.category = service.category;
    
    // Badges
    let badges = '';
    if (service.verified) {
        badges += `<span class="badge verified"><i class="fas fa-check-circle"></i> Verified</span>`;
    }
    if (service.isNew) {
        badges += `<span class="badge new">New</span>`;
    }
    
    // Distance
    let distanceInfo = '';
    if (service.distance) {
        distanceInfo = `<span class="distance"><i class="fas fa-map-marker-alt"></i> ${service.distance} km</span>`;
    }
    
    // Favorite button
    const isFav = appState.favorites.has(service.id);
    const favClass = isFav ? 'fas' : 'far';
    
    // Rating stars
    const rating = appState.ratings.get(service.id) || 0;
    let ratingStars = '';
    for (let i = 1; i <= 5; i++) {
        ratingStars += `<button class="btn-icon rating-btn" data-rating="${i}" aria-label="Rate ${i} stars">
            <i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>
        </button>`;
    }
    
    card.innerHTML = `
        <header class="card-header">
            <div class="badges">${badges}</div>
            <h3>${service.name}</h3>
            <p class="category">${service.category}</p>
        </header>
        
        <div class="card-body">
            <div class="service-info">
                <p class="location">${service.location} ${distanceInfo}</p>
                <p class="description">${service.description}</p>
                
                ${service.hours ? `<p class="hours"><i class="fas fa-clock"></i> ${service.hours}</p>` : ''}
                
                ${service.services ? `
                <div class="service-tags">
                    ${service.services.map(s => `<span class="tag">${s}</span>`).join('')}
                </div>
                ` : ''}
                
                <div class="rating">
                    ${ratingStars}
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn-icon favorite-btn" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="${favClass} fa-heart"></i>
                </button>
                <a href="tel:${service.phone}" class="btn-primary">
                    <i class="fas fa-phone"></i> Call Now
                </a>
            </div>
        </div>
    `;
    
    // Add event listener to favorite button
    card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(service.id));
    
    // Add event listeners to rating buttons
    card.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const rating = parseInt(btn.dataset.rating);
            toggleRating(service.id, rating);
        });
    });
    
    return card;
}

// ===== FILTERING & SORTING ===== //

function filterServices() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    const categoryFilter = dom.categoryFilter.value;
    
    appState.filteredServices = appState.services.filter(service => {
        // Category filter
        if (categoryFilter && service.category !== categoryFilter) {
            return false;
        }
        
        // Search term
        if (searchTerm) {
            const matchesSearch = 
                service.name.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm) ||
                service.location.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                (service.services && service.services.some(s => s.toLowerCase().includes(searchTerm)));
            
            if (!matchesSearch) return false;
        }
        
        return true;
    });
}

function sortServices() {
    const sortMethod = dom.sortBy.value;
    
    switch (sortMethod) {
        case 'distance':
            if (appState.userLocation) {
                appState.filteredServices.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            }
            break;
            
        case 'name':
            appState.filteredServices.sort((a, b) => a.name.localeCompare(b.name));
            break;
            
        default:
            // Default sorting (by verification status then by name)
            appState.filteredServices.sort((a, b) => {
                if (a.verified !== b.verified) {
                    return a.verified ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
    }
}

// ===== GEOLOCATION ===== //

function setupGeolocation() {
    dom.locationFilter.addEventListener('click', () => {
        if (appState.userLocation) {
            // Already have location - just re-sort
            updateDistances();
            filterAndRenderServices();
            return;
        }
        
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            return;
        }
        
        dom.locationFilter.disabled = true;
        dom.locationFilter.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                updateDistances();
                filterAndRenderServices();
                
                dom.locationFilter.innerHTML = '<i class="fas fa-location-arrow"></i> Near Me';
                dom.locationFilter.disabled = false;
                
                showToast('Location found! Sorting by distance', 'success');
            },
            error => {
                console.error('Geolocation error:', error);
                showToast('Could not determine your location', 'error');
                
                dom.locationFilter.innerHTML = '<i class="fas fa-location-arrow"></i> Near Me';
                dom.locationFilter.disabled = false;
            },
            { timeout: 10000 }
        );
    });
}

function updateDistances() {
    if (!appState.userLocation) return;
    
    appState.services.forEach(service => {
        if (service.lat && service.lng) {
            service.distance = calculateDistance(
                appState.userLocation.lat,
                appState.userLocation.lng,
                service.lat,
                service.lng
            );
        }
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in km with 1 decimal
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// ===== FAVORITES SYSTEM ===== //

function loadFavorites() {
    try {
        const favorites = localStorage.getItem(FAVORITES_KEY);
        if (favorites) {
            appState.favorites = new Set(JSON.parse(favorites));
        }
    } catch (error) {
        console.error('Failed to load favorites:', error);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...appState.favorites]));
    } catch (error) {
        console.error('Failed to save favorites:', error);
    }
}

function toggleFavorite(serviceId) {
    if (appState.favorites.has(serviceId)) {
        appState.favorites.delete(serviceId);
        showToast('Removed from favorites', 'success');
    } else {
        appState.favorites.add(serviceId);
        showToast('Added to favorites', 'success');
    }
    
    saveFavorites();
    filterAndRenderServices(); // Re-render to update heart icons
}

// ===== THEME MANAGEMENT ===== //

function loadThemePreference() {
    try {
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        setTheme(savedTheme);
    } catch (error) {
        console.error('Failed to load theme preference:', error);
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    appState.currentTheme = theme;
    
    // Update toggle button icon
    const icon = dom.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Save preference
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.error('Failed to save theme preference:', error);
    }
}

function toggleTheme() {
    const newTheme = appState.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`);
}

// ===== UI UTILITIES ===== //

function showToast(message, type = 'info') {
    // Clear previous toast if any
    dom.toast.className = 'toast hidden';
    clearTimeout(dom.toast.timeoutId);
    
    // Set new toast content
    dom.toast.textContent = message;
    dom.toast.classList.add(type);
    dom.toast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    dom.toast.timeoutId = setTimeout(() => {
        dom.toast.classList.add('hidden');
    }, 3000);
}

// ===== EVENT LISTENERS ===== //

function setupEventListeners() {
    // Search functionality
    dom.searchBtn.addEventListener('click', filterAndRenderServices);
    dom.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterAndRenderServices();
    });
    
    // Filters
    dom.categoryFilter.addEventListener('change', filterAndRenderServices);
    dom.sortBy.addEventListener('change', filterAndRenderServices);
    
    // Geolocation
    setupGeolocation();
    
    // Theme toggle
    dom.themeToggle.addEventListener('click', toggleTheme);
}

// ===== SERVICE WORKER REGISTRATION ===== //

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('assets/js/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}