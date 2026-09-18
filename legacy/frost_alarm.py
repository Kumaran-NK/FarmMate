import streamlit as st
import pandas as pd
import numpy as np
import requests
import joblib
import json
from datetime import datetime, date
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

# Set page configuration
st.set_page_config(
    page_title="Indian Frost Prediction System",
    page_icon="❄️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 2rem;
    }
    .sub-header {
        font-size: 1.8rem;
        color: #0D47A1;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    .risk-high {
        background-color: #ff4b4b;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .risk-moderate {
        background-color: #ffa500;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .risk-low {
        background-color: #f0e68c;
        color: black;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .risk-very-low {
        background-color: #90ee90;
        color: black;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .weather-card {
        background-color: #f0f8ff;
        padding: 15px;
        border-radius: 10px;
        border-left: 5px solid #1E88E5;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# City database
CITIES_DATA = {
    "Leh": {"lat": 34.15, "lon": 77.58, "elevation": 3500, "region": "Himalayan"},
    "Shimla": {"lat": 31.10, "lon": 77.17, "elevation": 2200, "region": "Himalayan"},
    "Srinagar": {"lat": 34.09, "lon": 74.80, "elevation": 1600, "region": "Himalayan"},
    "Manali": {"lat": 32.24, "lon": 77.19, "elevation": 2050, "region": "Himalayan"},
    "Dehradun": {"lat": 30.32, "lon": 78.03, "elevation": 650, "region": "Himalayan"},
    "Shillong": {"lat": 25.58, "lon": 91.89, "elevation": 1500, "region": "Northeast"},
    "Gangtok": {"lat": 27.34, "lon": 88.61, "elevation": 1600, "region": "Himalayan"},
    "Dalhousie": {"lat": 32.53, "lon": 75.95, "elevation": 2000, "region": "Himalayan"},
    "Nainital": {"lat": 29.39, "lon": 79.45, "elevation": 2100, "region": "Himalayan"},
    "Mussoorie": {"lat": 30.46, "lon": 78.08, "elevation": 2000, "region": "Himalayan"},
    "Darjeeling": {"lat": 27.04, "lon": 88.27, "elevation": 2100, "region": "Himalayan"},
    "Ooty": {"lat": 11.41, "lon": 76.70, "elevation": 2200, "region": "Southern"},
    "Kodaikanal": {"lat": 10.23, "lon": 77.49, "elevation": 2100, "region": "Southern"},
    "Munnar": {"lat": 10.09, "lon": 77.06, "elevation": 1600, "region": "Southern"},
    "Coonoor": {"lat": 11.35, "lon": 76.82, "elevation": 1800, "region": "Southern"},
    "Amritsar": {"lat": 31.63, "lon": 74.87, "elevation": 230, "region": "Northern"},
    "Chandigarh": {"lat": 30.73, "lon": 76.78, "elevation": 350, "region": "Northern"},
    "Jaipur": {"lat": 26.91, "lon": 75.79, "elevation": 430, "region": "Northern"},
    "Delhi": {"lat": 28.61, "lon": 77.21, "elevation": 220, "region": "Northern"},
    "Lucknow": {"lat": 26.85, "lon": 80.95, "elevation": 120, "region": "Northern"}
}

REGION_ENCODING = {
    'Himalayan': 0,
    'Northeast': 1,
    'Southern': 2,
    'Northern': 3
}

# Helper functions
def get_weather_data(city_name, api_key):
    """Fetch current weather data from OpenWeatherMap API"""
    city_lower = city_name.lower()
    matching_cities = [name for name in CITIES_DATA.keys() if name.lower() == city_lower]
    
    if not matching_cities:
        raise ValueError(f"City '{city_name}' not found in database")
    
    city_name = matching_cities[0]
    city_info = CITIES_DATA[city_name]
    
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={city_info['lat']}&lon={city_info['lon']}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.json()
        
        weather_data['city_info'] = {
            'name': city_name,
            'elevation': city_info['elevation'],
            'region': city_info['region'],
            'coordinates': (city_info['lat'], city_info['lon'])
        }
        
        return weather_data
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching weather data for {city_name}: {e}")

def create_prediction_input(weather_data):
    """Create input features for prediction from weather API data"""
    current_time = datetime.now()
    city_info = weather_data['city_info']
    
    main_data = weather_data.get('main', {})
    wind_data = weather_data.get('wind', {})
    clouds_data = weather_data.get('clouds', {})
    weather_list = weather_data.get('weather', [{}])
    
    features = {
        'temp': main_data.get('temp', 0),
        'feels_like': main_data.get('feels_like', 0),
        'pressure': main_data.get('pressure', 0),
        'humidity': main_data.get('humidity', 0),
        'dew_point': main_data.get('temp', 0) - ((100 - main_data.get('humidity', 0)) / 5) if main_data.get('humidity') is not None else 0,
        'clouds': clouds_data.get('all', 0),
        'wind_speed': wind_data.get('speed', 0),
        'wind_deg': wind_data.get('deg', 0),
        'weather_id': weather_list[0].get('id', 800) if weather_list else 800,
        'elevation': city_info['elevation'],
        'hour': current_time.hour,
        'day_of_year': current_time.timetuple().tm_yday,
        'month': current_time.month,
        'day_of_week': current_time.weekday(),
        'is_weekend': 1 if current_time.weekday() >= 5 else 0,
    }
    
    # Add cyclical encoding
    features['hour_sin'] = np.sin(2 * np.pi * features['hour'] / 24)
    features['hour_cos'] = np.cos(2 * np.pi * features['hour'] / 24)
    features['day_sin'] = np.sin(2 * np.pi * features['day_of_year'] / 365.25)
    features['day_cos'] = np.cos(2 * np.pi * features['day_of_year'] / 365.25)
    features['month_sin'] = np.sin(2 * np.pi * (features['month'] - 1) / 12)
    features['month_cos'] = np.cos(2 * np.pi * (features['month'] - 1) / 12)
    
    # Add seasonality
    features['season'] = (features['month'] % 12 + 3) // 3
    features['is_winter'] = 1 if features['season'] in [1, 4] else 0
    
    # Add meteorological indices
    features['heat_index'] = 0.5 * (features['temp'] + 61.0 + ((features['temp'] - 68.0) * 1.2) + (features['humidity'] * 0.094))
    features['wind_chill'] = 13.12 + 0.6215 * features['temp'] - 11.37 * (features['wind_speed'] ** 0.16) + 0.3965 * features['temp'] * (features['wind_speed'] ** 0.16)
    features['frost_risk_index'] = (features['dew_point'] - features['temp']) + (100 - features['humidity']) / 10 + features['wind_speed']
    features['dew_point_depression'] = features['temp'] - features['dew_point']
    
    # Add encoded city and region
    features['city_encoded'] = list(CITIES_DATA.keys()).index(city_info['name'])
    features['region_encoded'] = REGION_ENCODING.get(city_info['region'], 0)
    
    # For lag features
    for lag in [1, 2, 3, 6]:
        for col in ['temp', 'humidity', 'wind_speed']:
            features[f'{col}_lag_{lag}'] = features[col]
    
    # For rolling features
    for col in ['temp', 'humidity', 'pressure', 'wind_speed']:
        features[f'{col}_6h_avg'] = features[col]
        features[f'{col}_6h_std'] = 0
    
    features['temp_change_3h'] = 0
    features['temp_change_6h'] = 0
    
    return features, city_info

def predict_frost_risk(city_name, api_key, model_path='frost_prediction_model.pkl'):
    """Predict frost risk for a given city"""
    try:
        model_data = joblib.load(model_path)
        model = model_data['model']
        scaler = model_data['scaler']
        feature_cols = model_data['feature_cols']
        optimal_threshold = model_data['optimal_threshold']
        
        weather_data = get_weather_data(city_name, api_key)
        input_features, city_info = create_prediction_input(weather_data)
        
        input_df = pd.DataFrame([input_features])
        
        for col in feature_cols:
            if col not in input_df.columns:
                input_df[col] = 0
        
        X_input = input_df[feature_cols]
        X_input_scaled = scaler.transform(X_input)
        
        probability = model.predict_proba(X_input_scaled)[0, 1]
        prediction = 1 if probability >= optimal_threshold else 0
        
        if probability >= 0.7:
            risk_level = "🚨 HIGH RISK - Frost very likely"
            action = "Take immediate protective measures for crops and infrastructure"
            alert_class = "risk-high"
        elif probability >= 0.5:
            risk_level = "⚠️ MODERATE RISK - Frost possible"
            action = "Monitor conditions closely and prepare protective measures"
            alert_class = "risk-moderate"
        elif probability >= 0.3:
            risk_level = "🔶 LOW RISK - Frost unlikely but possible"
            action = "Stay alert for changing conditions"
            alert_class = "risk-low"
        else:
            risk_level = "✅ VERY LOW RISK - Frost very unlikely"
            action = "No action needed"
            alert_class = "risk-very-low"
        
        result = {
            'city': city_info['name'],
            'region': city_info['region'],
            'elevation': city_info['elevation'],
            'coordinates': city_info['coordinates'],
            'temperature': input_features['temp'],
            'feels_like': input_features['feels_like'],
            'humidity': input_features['humidity'],
            'wind_speed': input_features['wind_speed'],
            'dew_point': input_features['dew_point'],
            'cloud_cover': input_features['clouds'],
            'frost_probability': probability,
            'frost_prediction': prediction,
            'risk_level': risk_level,
            'recommended_action': action,
            'alert_class': alert_class,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'threshold_used': optimal_threshold,
        }
        
        return result
        
    except Exception as e:
        return {'error': str(e)}

def get_weekly_weather_forecast(city_name, api_key):
    """Get 7-day weather forecast from OpenWeatherMap API"""
    city_lower = city_name.lower()
    matching_cities = [name for name in CITIES_DATA.keys() if name.lower() == city_lower]
    
    if not matching_cities:
        raise ValueError(f"City '{city_name}' not found")
    
    city_name = matching_cities[0]
    city_info = CITIES_DATA[city_name]
    city_info['name'] = city_name
    
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={city_info['lat']}&lon={city_info['lon']}&appid={api_key}&units=metric&cnt=40"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        forecast_data = response.json()
        
        daily_forecasts = process_daily_forecast(forecast_data, city_info)
        return daily_forecasts
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching forecast data: {e}")

def process_daily_forecast(forecast_data, city_info):
    """Convert 3-hour intervals into daily forecasts"""
    from collections import defaultdict
    
    daily_data = defaultdict(list)
    
    for interval in forecast_data['list']:
        dt = datetime.fromtimestamp(interval['dt'])
        date_key = dt.date()
        
        daily_data[date_key].append({
            'datetime': dt,
            'temp': interval['main']['temp'],
            'feels_like': interval['main']['feels_like'],
            'humidity': interval['main']['humidity'],
            'pressure': interval['main']['pressure'],
            'wind_speed': interval['wind']['speed'],
            'wind_deg': interval['wind'].get('deg', 0),
            'clouds': interval['clouds']['all'],
            'weather_id': interval['weather'][0]['id'] if interval['weather'] else 800
        })
    
    daily_forecasts = []
    for date, intervals in daily_data.items():
        temps = [x['temp'] for x in intervals]
        humidities = [x['humidity'] for x in intervals]
        pressures = [x['pressure'] for x in intervals]
        wind_speeds = [x['wind_speed'] for x in intervals]
        clouds = [x['clouds'] for x in intervals]
        
        night_intervals = [x for x in intervals if 20 <= x['datetime'].hour <= 23 or 0 <= x['datetime'].hour <= 6]
        
        daily_forecast = {
            'date': date,
            'min_temp': min(temps) if temps else 0,
            'max_temp': max(temps) if temps else 0,
            'avg_temp': sum(temps) / len(temps) if temps else 0,
            'min_humidity': min(humidities) if humidities else 0,
            'max_humidity': max(humidities) if humidities else 0,
            'avg_humidity': sum(humidities) / len(humidities) if humidities else 0,
            'avg_pressure': sum(pressures) / len(pressures) if pressures else 0,
            'avg_wind_speed': sum(wind_speeds) / len(wind_speeds) if wind_speeds else 0,
            'avg_clouds': sum(clouds) / len(clouds) if clouds else 0,
            'night_min_temp': min([x['temp'] for x in night_intervals]) if night_intervals else (min(temps) if temps else 0),
            'night_avg_humidity': sum([x['humidity'] for x in night_intervals])/len(night_intervals) if night_intervals else (sum(humidities)/len(humidities) if humidities else 0),
            'night_avg_wind_speed': sum([x['wind_speed'] for x in night_intervals])/len(night_intervals) if night_intervals else (sum(wind_speeds)/len(wind_speeds) if wind_speeds else 0),
            'night_avg_clouds': sum([x['clouds'] for x in night_intervals])/len(night_intervals) if night_intervals else (sum(clouds)/len(clouds) if clouds else 0),
            'city_info': city_info,
        }
        daily_forecasts.append(daily_forecast)
    
    return daily_forecasts

def predict_weekly_frost_risk(city_name, api_key, model_path='frost_prediction_model.pkl'):
    """Predict frost risk for the next 7 days"""
    try:
        model_data = joblib.load(model_path)
        model = model_data['model']
        scaler = model_data['scaler']
        feature_cols = model_data['feature_cols']
        optimal_threshold = model_data.get('optimal_threshold', 0.3)
        
        daily_forecasts = get_weekly_weather_forecast(city_name, api_key)
        
        if not daily_forecasts:
            return {'error': 'No forecast data received'}
        
        results = []
        for i, daily_data in enumerate(daily_forecasts):
            if i >= 7:
                break
                
            target_date = daily_data['date']
            
            features = {
                'temp': daily_data['night_min_temp'],
                'feels_like': daily_data['night_min_temp'] - 1.5,
                'pressure': daily_data['avg_pressure'],
                'humidity': daily_data['night_avg_humidity'],
                'dew_point': daily_data['night_min_temp'] - ((100 - daily_data['night_avg_humidity']) / 5),
                'clouds': daily_data['night_avg_clouds'],
                'wind_speed': daily_data['night_avg_wind_speed'],
                'wind_deg': 0,
                'weather_id': 800,
                'elevation': daily_data['city_info']['elevation'],
                'hour': 2,
                'day_of_year': target_date.timetuple().tm_yday,
                'month': target_date.month,
                'day_of_week': target_date.weekday(),
                'is_weekend': 1 if target_date.weekday() >= 5 else 0,
            }
            
            # Add cyclical encoding and other features (simplified for brevity)
            features['hour_sin'] = np.sin(2 * np.pi * features['hour'] / 24)
            features['hour_cos'] = np.cos(2 * np.pi * features['hour'] / 24)
            features['day_sin'] = np.sin(2 * np.pi * features['day_of_year'] / 365.25)
            features['day_cos'] = np.cos(2 * np.pi * features['day_of_year'] / 365.25)
            features['month_sin'] = np.sin(2 * np.pi * (features['month'] - 1) / 12)
            features['month_cos'] = np.cos(2 * np.pi * (features['month'] - 1) / 12)
            
            features['season'] = (features['month'] % 12 + 3) // 3
            features['is_winter'] = 1 if features['season'] in [1, 4] else 0
            
            features['heat_index'] = 0.5 * (features['temp'] + 61.0 + ((features['temp'] - 68.0) * 1.2) + (features['humidity'] * 0.094))
            features['wind_chill'] = 13.12 + 0.6215 * features['temp'] - 11.37 * (features['wind_speed'] ** 0.16) + 0.3965 * features['temp'] * (features['wind_speed'] ** 0.16)
            features['frost_risk_index'] = (features['dew_point'] - features['temp']) + (100 - features['humidity']) / 10 + features['wind_speed']
            features['dew_point_depression'] = features['temp'] - features['dew_point']
            
            features['city_encoded'] = list(CITIES_DATA.keys()).index(daily_data['city_info']['name'])
            features['region_encoded'] = REGION_ENCODING.get(daily_data['city_info']['region'], 0)
            
            for lag in [1, 2, 3, 6]:
                for col in ['temp', 'humidity', 'wind_speed']:
                    features[f'{col}_lag_{lag}'] = features[col]
            
            for col in ['temp', 'humidity', 'pressure', 'wind_speed']:
                features[f'{col}_6h_avg'] = features[col]
                features[f'{col}_6h_std'] = 0
            
            features['temp_change_3h'] = 0
            features['temp_change_6h'] = 0
            
            input_df = pd.DataFrame([features])
            
            for col in feature_cols:
                if col not in input_df.columns:
                    input_df[col] = 0
            
            X_input = input_df[feature_cols]
            X_input_scaled = scaler.transform(X_input)
            
            probability = model.predict_proba(X_input_scaled)[0, 1]
            prediction = 1 if probability >= optimal_threshold else 0
            
            if probability >= 0.7:
                risk_level = "🚨 HIGH RISK"
            elif probability >= 0.5:
                risk_level = "⚠️ MODERATE RISK"
            elif probability >= 0.3:
                risk_level = "🔶 LOW RISK"
            else:
                risk_level = "✅ VERY LOW RISK"
            
            results.append({
                'date': target_date.strftime('%Y-%m-%d'),
                'min_temp': daily_data['min_temp'],
                'max_temp': daily_data['max_temp'],
                'night_min_temp': daily_data['night_min_temp'],
                'frost_probability': float(probability),
                'frost_prediction': prediction,
                'risk_level': risk_level
            })
        
        return results
        
    except Exception as e:
        return {'error': str(e)}

# Main app
def main():
    st.markdown('<h1 class="main-header">❄️ Indian Cities Frost Prediction System</h1>', unsafe_allow_html=True)
    
    # Sidebar
    st.sidebar.title("Navigation")
    app_mode = st.sidebar.selectbox("Choose Mode", ["Current Prediction", "Weekly Forecast", "About"])
    
    # API Key input
    api_key = st.sidebar.text_input("OpenWeatherMap API Key", type="password", 
                                  help="Get your API key from https://openweathermap.org/api")
    
    if not api_key:
        st.sidebar.warning("Please enter your OpenWeatherMap API key to use the app")
    
    # Main content
    if app_mode == "Current Prediction":
        st.markdown('<h2 class="sub-header">Current Frost Risk Prediction</h2>', unsafe_allow_html=True)
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            selected_city = st.selectbox("Select City", list(CITIES_DATA.keys()))
            
            if st.button("Predict Frost Risk", type="primary") and api_key:
                with st.spinner("Fetching weather data and predicting..."):
                    result = predict_frost_risk(selected_city, api_key)
                    
                    if 'error' in result:
                        st.error(f"Error: {result['error']}")
                    else:
                        st.markdown(f'<div class="{result["alert_class"]}">{result["risk_level"]}</div>', unsafe_allow_html=True)
                        
                        st.metric("Frost Probability", f"{result['frost_probability']:.3f}")
                        st.metric("Temperature", f"{result['temperature']:.1f}°C")
                        st.metric("Humidity", f"{result['humidity']:.0f}%")
                        st.metric("Dew Point", f"{result['dew_point']:.1f}°C")
                        
                        st.info(f"**Recommended Action:** {result['recommended_action']}")
        
        with col2:
            if api_key and 'result' in locals():
                # Create weather card
                st.markdown("### 🌡️ Current Weather Conditions")
                st.markdown(f'<div class="weather-card">'
                           f'<p><strong>📍 City:</strong> {result["city"]} ({result["region"]})</p>'
                           f'<p><strong>🏔️ Elevation:</strong> {result["elevation"]}m</p>'
                           f'<p><strong>🌡️ Temperature:</strong> {result["temperature"]:.1f}°C (Feels like: {result["feels_like"]:.1f}°C)</p>'
                           f'<p><strong>💧 Humidity:</strong> {result["humidity"]:.0f}%</p>'
                           f'<p><strong>💨 Wind Speed:</strong> {result["wind_speed"]:.1f} m/s</p>'
                           f'<p><strong>☁️ Cloud Cover:</strong> {result["cloud_cover"]:.0f}%</p>'
                           f'</div>', unsafe_allow_html=True)
                
                # Create frost probability gauge
                fig = go.Figure(go.Indicator(
                    mode = "gauge+number+delta",
                    value = result['frost_probability'],
                    domain = {'x': [0, 1], 'y': [0, 1]},
                    title = {'text': "Frost Probability"},
                    delta = {'reference': result['threshold_used'], 'increasing': {'color': "red"}},
                    gauge = {
                        'axis': {'range': [0, 1]},
                        'bar': {'color': "darkblue"},
                        'steps': [
                            {'range': [0, 0.3], 'color': "lightgreen"},
                            {'range': [0.3, 0.5], 'color': "yellow"},
                            {'range': [0.5, 0.7], 'color': "orange"},
                            {'range': [0.7, 1], 'color': "red"}
                        ],
                        'threshold': {
                            'line': {'color': "red", 'width': 4},
                            'thickness': 0.75,
                            'value': result['threshold_used']
                        }
                    }
                ))
                fig.update_layout(height=300)
                st.plotly_chart(fig, use_container_width=True)
    
    elif app_mode == "Weekly Forecast":
        st.markdown('<h2 class="sub-header">7-Day Frost Forecast</h2>', unsafe_allow_html=True)
        
        selected_city = st.selectbox("Select City", list(CITIES_DATA.keys()))
        
        if st.button("Get Weekly Forecast", type="primary") and api_key:
            with st.spinner("Fetching weekly forecast data..."):
                results = predict_weekly_frost_risk(selected_city, api_key)
                
                if 'error' in results:
                    st.error(f"Error: {results['error']}")
                else:
                    # Create forecast table
                    forecast_df = pd.DataFrame(results)
                    st.dataframe(forecast_df.style.format({
                        'min_temp': '{:.1f}°C',
                        'max_temp': '{:.1f}°C',
                        'night_min_temp': '{:.1f}°C',
                        'frost_probability': '{:.3f}'
                    }))
                    
                    # Create forecast chart
                    fig = make_subplots(specs=[[{"secondary_y": True}]])
                    
                    fig.add_trace(
                        go.Scatter(x=forecast_df['date'], y=forecast_df['night_min_temp'], 
                                  name="Night Min Temp", line=dict(color='blue')),
                        secondary_y=False,
                    )
                    
                    fig.add_trace(
                        go.Bar(x=forecast_df['date'], y=forecast_df['frost_probability'], 
                              name="Frost Probability", marker_color='red', opacity=0.6),
                        secondary_y=True,
                    )
                    
                    fig.update_layout(
                        title_text="7-Day Temperature and Frost Probability Forecast"
                    )
                    
                    fig.update_xaxes(title_text="Date")
                    fig.update_yaxes(title_text="Temperature (°C)", secondary_y=False)
                    fig.update_yaxes(title_text="Frost Probability", secondary_y=True, range=[0, 1])
                    
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Summary statistics
                    high_risk_days = sum(1 for r in results if r['frost_probability'] >= 0.7)
                    moderate_risk_days = sum(1 for r in results if 0.5 <= r['frost_probability'] < 0.7)
                    frost_days = sum(1 for r in results if r['frost_prediction'] == 1)
                    
                    col1, col2, col3 = st.columns(3)
                    col1.metric("High Risk Days", high_risk_days)
                    col2.metric("Moderate Risk Days", moderate_risk_days)
                    col3.metric("Frost Days Predicted", frost_days)
                    
                    # Recommendations
                    if high_risk_days > 0:
                        st.warning("**🎯 Recommendations:**")
                        if high_risk_days >= 3:
                            st.write("- Implement sustained protective measures for crops")
                            st.write("- Use frost protection systems (sprinklers, heaters)")
                            st.write("- Monitor weather updates 2-3 times daily")
                        else:
                            st.write("- Be prepared for occasional frost events")
                            st.write("- Cover sensitive plants during nights")
    
    elif app_mode == "About":
        st.markdown('<h2 class="sub-header">About the Frost Prediction System</h2>', unsafe_allow_html=True)
        
        st.write("""
        This application predicts frost events in Indian cities using machine learning models trained on historical weather data.
        
        ### Features:
        - **Current Prediction**: Real-time frost risk assessment for selected cities
        - **Weekly Forecast**: 7-day frost probability forecast
        - **Risk Assessment**: Four-level risk classification (High, Moderate, Low, Very Low)
        
        ### How it works:
        1. Fetches current weather data from OpenWeatherMap API
        2. Processes the data using engineered features
        3. Uses a trained XGBoost model to predict frost probability
        4. Provides actionable recommendations based on risk level
        
        ### Technical Details:
        - **Model**: XGBoost classifier with optimized threshold
        - **Features**: Temperature, humidity, pressure, wind speed, elevation, and derived meteorological indices
        - **Accuracy**: >93% on test data
        - **Coverage**: 20 major Indian cities across different regions
        
        ### Cities Covered:
        """)
        
        # Display cities by region
        regions = {}
        for city, info in CITIES_DATA.items():
            if info['region'] not in regions:
                regions[info['region']] = []
            regions[info['region']].append(city)
        
        for region, cities in regions.items():
            with st.expander(f"{region} Region ({len(cities)} cities)"):
                st.write(", ".join(cities))
        
        st.info("""
        **Note**: This is a predictive system and should be used as a supplementary tool. 
        Always consult local weather authorities for critical decisions.
        """)

if __name__ == "__main__":
    main()