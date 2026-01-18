// WeatherWise - Multi-Source Weather Application
// Currently using WeatherAPI.com for all functionality
// OpenWeatherMap integration disabled due to invalid API key

const API_KEYS = {
    openWeather: '918efd953d4067b03eabd55d12863d1b', 
    weatherApi: '55b7786f0de84d53bf5200355261801'        
};

class WeatherApp {
    constructor() {
        this.currentUnit = 'celsius';
        this.currentLocation = null;
        this.init();
    }

    init() {
        // Check if API keys are set
        if (API_KEYS.openWeather === 'YOUR_OPENWEATHER_API_KEY' || API_KEYS.weatherApi === 'YOUR_WEATHERAPI_KEY') {
            this.showError('Please replace the API key placeholders in script.js with your actual API keys from OpenWeatherMap and WeatherAPI.com. See README.md for setup instructions.');
            return;
        }

        this.bindEvents();
        this.loadDefaultLocation();
    }

    bindEvents() {
        const searchBtn = document.getElementById('search-btn');
        const locationInput = document.getElementById('location-input');
        const unitToggle = document.getElementById('unit-toggle');

        searchBtn.addEventListener('click', () => this.searchWeather());
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        locationInput.addEventListener('input', (e) => this.handleLocationInput(e));
        unitToggle.addEventListener('click', () => this.toggleUnit());
    }

    async loadDefaultLocation() {
        // Try to get user's location
        if (navigator.geolocation) {
            try {
                const position = await this.getCurrentPosition();
                const { latitude, longitude } = position.coords;
                await this.fetchWeatherByCoords(latitude, longitude);
            } catch (error) {
                console.log('Geolocation denied, loading default city');
                this.searchWeather('London'); // Default city
            }
        } else {
            this.searchWeather('London');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    async handleLocationInput(e) {
        const query = e.target.value.trim();
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const suggestions = await this.fetchLocationSuggestions(query);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    async fetchLocationSuggestions(query) {
        // Using WeatherAPI for location suggestions
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${API_KEYS.weatherApi}&q=${query}`
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid WeatherAPI key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('WeatherAPI rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Failed to fetch location suggestions: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return data.slice(0, 5).map(location => ({
            name: `${location.name}, ${location.country}`,
            lat: location.lat,
            lon: location.lon
        }));
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('location-suggestions');
        container.innerHTML = '';

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion.name;
            div.addEventListener('click', () => {
                document.getElementById('location-input').value = suggestion.name;
                this.hideSuggestions();
                this.fetchWeatherByCoords(suggestion.lat, suggestion.lon);
            });
            container.appendChild(div);
        });

        container.classList.remove('hidden');
    }

    hideSuggestions() {
        document.getElementById('location-suggestions').classList.add('hidden');
    }

    async searchWeather(location = null) {
        const query = location || document.getElementById('location-input').value.trim();
        if (!query) return;

        this.showLoading();
        this.hideError();

        try {
            // First get coordinates
            const coords = await this.getCoordinates(query);
            await this.fetchWeatherByCoords(coords.lat, coords.lon);
        } catch (error) {
            this.showError('Location not found. Please try a different search term.');
            console.error('Search error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async getCoordinates(location) {
        // Using WeatherAPI for geocoding since OpenWeatherMap key is invalid
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${API_KEYS.weatherApi}&q=${location}`
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid WeatherAPI key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('WeatherAPI rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Failed to get coordinates: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        if (data.length === 0) throw new Error('Location not found');

        return { lat: data[0].lat, lon: data[0].lon };
    }

    async fetchWeatherByCoords(lat, lon) {
        try {
            // Fetch current weather from OpenWeatherMap
            const currentWeather = await this.fetchCurrentWeather(lat, lon);

            // Fetch forecast from WeatherAPI.com
            const forecast = await this.fetchForecast(lat, lon);

            this.displayWeather(currentWeather, forecast);
            this.generatePackingSuggestions(currentWeather, forecast);
        } catch (error) {
            this.showError('Failed to fetch weather data. Please try again.');
            console.error('Weather fetch error:', error);
        }
    }

    async fetchCurrentWeather(lat, lon) {
        // Using WeatherAPI for current weather since OpenWeatherMap key is invalid
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEYS.weatherApi}&q=${lat},${lon}&aqi=no`
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid WeatherAPI key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('WeatherAPI rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Failed to fetch current weather: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return {
            location: `${data.location.name}, ${data.location.country}`,
            temp: data.current.temp_c,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph / 3.6, // Convert km/h to m/s for consistency
            description: data.current.condition.text,
            icon: this.mapWeatherIcon(data.current.condition.code),
            precipitation: data.current.precip_mm || 0
        };
    }

    async fetchForecast(lat, lon) {
        // WeatherAPI.com requires location name, so we'll use approximate location
        // For demo purposes, we'll use a simplified approach
        // In production, you'd need to handle this better
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEYS.weatherApi}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid WeatherAPI.com API key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('WeatherAPI.com rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Failed to fetch forecast: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return data.forecast.forecastday.map(day => ({
            date: day.date,
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            description: day.day.condition.text,
            icon: day.day.condition.icon,
            chanceOfRain: day.day.daily_chance_of_rain
        }));
    }

    displayWeather(current, forecast) {
        // Update location
        document.getElementById('location-name').textContent = current.location;
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update current weather
        this.updateTemperature(current.temp);
        document.getElementById('humidity').textContent = current.humidity;
        document.getElementById('wind-speed').textContent = Math.round(current.windSpeed * 3.6); // m/s to km/h
        document.getElementById('precipitation').textContent = current.precipitation > 0 ? Math.round(current.precipitation * 100) : 0;
        document.getElementById('weather-description').textContent = current.description;

        // Update weather icon
        const iconElement = document.getElementById('weather-icon');
        iconElement.className = `fas ${this.getWeatherIcon(current.icon)}`;

        // Update forecast
        this.displayForecast(forecast);

        // Show weather display
        document.getElementById('weather-display').classList.remove('hidden');
    }

    updateTemperature(tempC) {
        const tempElement = document.getElementById('current-temp');
        const unitBtn = document.getElementById('unit-toggle');

        if (this.currentUnit === 'celsius') {
            tempElement.textContent = Math.round(tempC);
            unitBtn.textContent = '°C';
        } else {
            tempElement.textContent = Math.round((tempC * 9/5) + 32);
            unitBtn.textContent = '°F';
        }
    }

    toggleUnit() {
        this.currentUnit = this.currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        // Re-fetch or recalculate temperature display
        if (this.currentLocation) {
            this.fetchWeatherByCoords(this.currentLocation.lat, this.currentLocation.lon);
        }
    }

    displayForecast(forecast) {
        const container = document.getElementById('forecast-container');
        container.innerHTML = '';

        forecast.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';

            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            dayElement.innerHTML = `
                <h4>${dayName}</h4>
                <div class="forecast-temp">
                    ${Math.round(day.maxTemp)}° / ${Math.round(day.minTemp)}°
                </div>
                <p class="forecast-desc">${day.description}</p>
                <p>Rain: ${day.chanceOfRain}%</p>
            `;

            container.appendChild(dayElement);
        });
    }

    generatePackingSuggestions(current, forecast) {
        const container = document.getElementById('packing-suggestions');
        container.innerHTML = '';

        const suggestions = this.analyzeWeatherForPacking(current, forecast);

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'packing-item';
            item.innerHTML = `
                <h4><i class="${suggestion.icon}"></i> ${suggestion.category}</h4>
                <p>${suggestion.items.join(', ')}</p>
            `;
            container.appendChild(item);
        });
    }

    analyzeWeatherForPacking(current, forecast) {
        const suggestions = [];
        const avgTemp = forecast.reduce((sum, day) => sum + day.maxTemp, 0) / forecast.length;
        const maxRainChance = Math.max(...forecast.map(day => day.chanceOfRain));

        // Temperature-based suggestions
        if (avgTemp < 10) {
            suggestions.push({
                category: 'Cold Weather',
                icon: 'fas fa-snowflake',
                items: ['Warm coat', 'Sweaters', 'Boots', 'Gloves', 'Scarf']
            });
        } else if (avgTemp < 20) {
            suggestions.push({
                category: 'Mild Weather',
                icon: 'fas fa-cloud',
                items: ['Light jacket', 'Long sleeves', 'Comfortable pants', 'Closed shoes']
            });
        } else {
            suggestions.push({
                category: 'Warm Weather',
                icon: 'fas fa-sun',
                items: ['T-shirts', 'Shorts', 'Sandals', 'Sunglasses', 'Sunscreen']
            });
        }

        // Rain-based suggestions
        if (maxRainChance > 50) {
            suggestions.push({
                category: 'Rain Protection',
                icon: 'fas fa-umbrella',
                items: ['Umbrella', 'Raincoat', 'Waterproof shoes', 'Plastic bags for electronics']
            });
        }

        // Wind-based suggestions
        if (current.windSpeed > 10) {
            suggestions.push({
                category: 'Wind Protection',
                icon: 'fas fa-wind',
                items: ['Windbreaker', 'Hair ties', 'Secure clothing']
            });
        }

        return suggestions;
    }

    mapWeatherIcon(conditionCode) {
        // Map WeatherAPI condition codes to OpenWeatherMap icon codes
        const iconMap = {
            1000: '01d', // Sunny
            1003: '02d', // Partly cloudy
            1006: '03d', // Cloudy
            1009: '04d', // Overcast
            1030: '50d', // Mist
            1063: '10d', // Patchy rain possible
            1180: '10d', // Light rain
            1183: '10d', // Light rain
            1186: '10d', // Moderate rain at times
            1189: '10d', // Moderate rain
            1192: '10d', // Heavy rain at times
            1195: '10d', // Heavy rain
            1198: '13d', // Light snow
            1201: '13d', // Moderate snow
            1204: '13d', // Light sleet
            1207: '13d', // Moderate or heavy sleet
            1210: '13d', // Patchy light snow
            1213: '13d', // Light snow
            1216: '13d', // Patchy moderate snow
            1219: '13d', // Moderate snow
            1222: '13d', // Patchy heavy snow
            1225: '13d', // Heavy snow
            1240: '09d', // Light rain shower
            1243: '09d', // Moderate or heavy rain shower
            1246: '09d', // Torrential rain shower
            1249: '13d', // Light sleet showers
            1252: '13d', // Moderate or heavy sleet showers
            1255: '13d', // Light snow showers
            1258: '13d', // Moderate or heavy snow showers
            1273: '11d', // Patchy light rain with thunder
            1276: '11d', // Moderate or heavy rain with thunder
            1279: '11d', // Patchy light snow with thunder
            1282: '11d'  // Moderate or heavy snow with thunder
        };
        return iconMap[conditionCode] || '01d';
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fa-sun',           // clear sky day
            '01n': 'fa-moon',          // clear sky night
            '02d': 'fa-cloud-sun',     // few clouds day
            '02n': 'fa-cloud-moon',    // few clouds night
            '03d': 'fa-cloud',         // scattered clouds
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',         // broken clouds
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',    // shower rain
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain', // rain day
            '10n': 'fa-cloud-moon-rain', // rain night
            '11d': 'fa-bolt',          // thunderstorm
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',     // snow
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',          // mist
            '50n': 'fa-smog'
        };
        return iconMap[iconCode] || 'fa-cloud';
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});