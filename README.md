WeatherWise - Multi-Source Weather Application

A modern, responsive weather application that aggregates data from multiple APIs to provide accurate weather information with intelligent packing suggestions.

Features

 Core Weather Functionality
- **Multi-API Integration**: Combines data from OpenWeatherMap and WeatherAPI.com for comprehensive weather information
- **Location Search**: Search for weather by city, state, or country with autocomplete suggestions
- **Current Weather**: Real-time temperature (Celsius/Fahrenheit), humidity, wind speed, and precipitation
- **5-Day Forecast**: Detailed weather predictions with temperature ranges and conditions
- **Unit Conversion**: Toggle between Celsius and Fahrenheit

 Unique Feature: Smart Packing Suggestions
- **Intelligent Analysis**: Analyzes weather conditions to provide personalized packing recommendations
- **Weather-Based Categories**:
  - Cold weather gear for temperatures below 10°C
  - Mild weather clothing for 10-20°C
  - Warm weather essentials for above 20°C
  - Rain protection when precipitation chance > 50%
  - Wind protection for windy conditions

User Experience
- **Modern UI/UX**: Clean, gradient-based design with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Easy-to-use interface with visual feedback
- **Error Handling**: Graceful error messages and loading states
- **Geolocation Support**: Automatic location detection for instant weather

Technical Architecture

 APIs Used
1. **WeatherAPI.com** (Primary)
   - Current weather conditions
   - 5-day weather forecast
   - Location search and geocoding
   - All weather data provided by WeatherAPI

2. **OpenWeatherMap** (Intended for backup - currently disabled due to invalid API key)
   - Was intended for current weather and geocoding
   - Can be re-enabled once a valid API key is obtained

Technologies
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with Flexbox and Grid
- **Fonts**: Google Fonts (Roboto)
- **Icons**: Font Awesome
- **Deployment**: Static web hosting (GitHub Pages, Netlify, etc.)

 Project Structure
```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # Application logic and API integration
└── README.md           # Documentation
```

 Setup and Installation

 Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for API calls
- API keys from OpenWeatherMap and WeatherAPI.com

 API Key Setup
1. Sign up for free accounts at:
   - [OpenWeatherMap](https://openweathermap.org/api) - Get an API key (free tier available)
   - [WeatherAPI.com](https://www.weatherapi.com/) - Get an API key (free tier available)

2. Replace placeholder API keys in `script.js`:
   ```javascript
   const API_KEYS = {
       openWeather: 'YOUR_OPENWEATHER_API_KEY',
       weatherApi: 'YOUR_WEATHERAPI_KEY'
   };
   ```

   **Important**: Make sure to replace both keys with your actual API keys. The app will show an error message if the placeholders are not replaced.

 Troubleshooting
- **"Failed to fetch weather data"**: Check that your API keys are correctly set and valid
- **"Invalid API key"**: Verify your API keys from the provider websites
- **Rate limit exceeded**: Free tiers have usage limits; wait or upgrade
- **Location not found**: Try searching with city name and country (e.g., "London, UK")

### Testing Your API Keys
You can test your keys directly in a browser:
- OpenWeatherMap: `https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=YOUR_KEY&units=metric`
- WeatherAPI: `https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=London`

 Running the Application
1. Clone or download the project files
2. Open `index.html` in a web browser
3. The app will automatically load weather for your current location (if geolocation is allowed)
4. Use the search bar to find weather for other locations

 Deployment

The application can be deployed to any static web hosting service:

GitHub Pages
1. Push code to a GitHub repository
2. Go to Settings > Pages
3. Select main branch as source
4. Access at `https://yourusername.github.io/repository-name/`

 Netlify/Vercel
1. Connect your repository
2. Deploy automatically
3. Get a custom domain if desired

 Error Handling

The application includes comprehensive error handling for:
- Network connectivity issues
- Invalid API responses
- Location not found
- Geolocation permission denied
- API rate limits

 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

Future Enhancements

- Weather alerts and notifications
- Historical weather data
- Weather comparison between locations
- Offline caching with Service Workers
- Dark mode toggle
- Additional language support

 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

 License

This project is open source and available under the MIT License.

 Acknowledgments

- Weather data provided by OpenWeatherMap and WeatherAPI.com
- Icons from Font Awesome
- Fonts from Google Fonts
