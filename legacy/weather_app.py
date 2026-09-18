import streamlit as st
import requests
import joblib
import numpy as np
import pandas as pd
import pytz
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import folium
from streamlit_folium import st_folium

# ------------------------
# SETTINGS
# ------------------------
API_KEY = 'd881de71e6cf19a923c0139398067320'
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

# ------------------------
# FUNCTIONS
# ------------------------
@st.cache_resource
def load_models():
    """Load all ML models with caching to improve performance"""
    try:
        rain_model = joblib.load("rain_model_xgb.joblib")
        temp_model = load_model("temp_model_lstm.h5", compile=False)
        hum_model = load_model("humidity_model_lstm.h5", compile=False)
        return rain_model, temp_model, hum_model
    except Exception as e:
        st.error(f"Error loading models: {e}")
        return None, None, None

@st.cache_data
def load_weather_data():
    """Load historical weather data for scalers"""
    try:
        df = pd.read_csv("weather.csv").dropna().drop_duplicates()
        temp_scaler = MinMaxScaler().fit(df['Temp'].values.reshape(-1, 1))
        hum_scaler = MinMaxScaler().fit(df['Humidity'].values.reshape(-1, 1))
        return df, temp_scaler, hum_scaler
    except Exception as e:
        st.error(f"Error loading weather data: {e}")
        return None, None, None

def get_current_weather(city):
    """Fetch current weather data from OpenWeather API"""
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()

    if response.status_code != 200:
        st.error(f"Could not retrieve data for {city}")
        return None

    return {
        'city': data['name'],
        'lat': data['coord']['lat'],
        'lon': data['coord']['lon'],
        'current_temp': data['main']['temp'],
        'feels_like': data['main']['feels_like'],
        'temp_min': data['main']['temp_min'],
        'temp_max': data['main']['temp_max'],
        'humidity': data['main']['humidity'],
        'description': data['weather'][0]['description'],
        'country': data['sys']['country'],
        'wind_dir': data['wind'].get('deg', 0),
        'pressure': data['main']['pressure'],
        'wind_speed': data['wind']['speed']
    }

def predict_future_lstm(model, scaler, current_values, n_steps=3, n_future=5):
    """Make future predictions using LSTM model"""
    predictions = []
    scaled_values = scaler.transform(np.array(current_values).reshape(-1, 1)).flatten()
    current_sequence = scaled_values[-n_steps:].reshape(1, n_steps, 1)

    for _ in range(n_future):
        next_pred = model.predict(current_sequence, verbose=0)
        predictions.append(scaler.inverse_transform(next_pred)[0][0])
        current_sequence = np.append(current_sequence[:, 1:, :], 
                                     next_pred.reshape(1, 1, 1), axis=1)
    return predictions

# ------------------------
# STREAMLIT APP
# ------------------------
# Page Config - Using the sample code's wide layout
st.set_page_config(page_title="🌦️ Weather Forecast for Farmers", layout="wide")

# Initialize session state to persist data
if "weather_data" not in st.session_state:
    st.session_state.weather_data = None
if "forecast_data" not in st.session_state:
    st.session_state.forecast_data = None

# Sidebar Input - Using the sample code's sidebar design
st.sidebar.title("🌍 Location")
city = st.sidebar.text_input("Enter City Name", "Chennai, IN")

# Button to fetch weather
if st.sidebar.button("📡 Fetch Weather"):
    with st.spinner("Fetching weather data..."):
        # Get current weather
        weather = get_current_weather(city.split(",")[0])  # Use only city name before comma
        
        if weather:
            # Load models and data
            rain_model, temp_model, hum_model = load_models()
            df, temp_scaler, hum_scaler = load_weather_data()
            
            if all([rain_model, temp_model, hum_model, df is not None]):
                # Rain Prediction
                current_df = pd.DataFrame([{
                    'MinTemp': weather['temp_min'],
                    'MaxTemp': weather['temp_max'],
                    'WindGustDir': weather['wind_dir'],
                    'WindGustSpeed': weather['wind_speed'],
                    'Humidity': weather['humidity'],
                    'Pressure': weather['pressure'],
                    'Temp': weather['current_temp'],
                    '3day_avg_temp': weather['current_temp'],
                    'prev_humidity': weather['humidity']
                }])
                
                rain_prediction = rain_model.predict(current_df)[0]
                
                # Future Predictions
                recent_temp = df['Temp'].tail(3).values
                recent_hum = df['Humidity'].tail(3).values
                
                future_temp = predict_future_lstm(temp_model, temp_scaler, recent_temp)
                future_hum = predict_future_lstm(hum_model, hum_scaler, recent_hum)
                
                # Time labels
                timezone = pytz.timezone('Asia/Kolkata')
                now = datetime.now(timezone)
                future_times = [(now + timedelta(hours=i+1)).strftime('%H:%M') for i in range(5)]
                
                # Store in session state
                st.session_state.weather_data = weather
                st.session_state.forecast_data = {
                    'rain_pred': rain_prediction,
                    'future_temp': future_temp,
                    'future_hum': future_hum,
                    'future_times': future_times
                }

# Main Title - Using the sample code's title
st.title("🌾 Weather Predictor")

# Display data if available in session state
if st.session_state.weather_data and st.session_state.forecast_data:
    weather = st.session_state.weather_data
    forecast = st.session_state.forecast_data
    
    # Display current weather - Using sample code's layout
    st.subheader(f"📍 Weather in {weather['city']}, {weather['country']}")
    col1, col2, col3 = st.columns(3)
    col1.metric("🌡️ Temperature", f"{weather['current_temp']:.1f}°C", f"Feels like {weather['feels_like']:.1f}°C")
    col2.metric("💧 Humidity", f"{weather['humidity']}%", f"Pressure: {weather['pressure']} hPa")
    col3.metric("🌬️ Wind", f"{weather['wind_speed']} m/s", f"Direction: {weather['wind_dir']}°")
    st.write(f"**Condition:** {weather['description'].title()}")

    st.divider()

    # Show location on map using Folium
    st.subheader("🗺️ City Location on Map")
    folium_map = folium.Map(location=[weather['lat'], weather['lon']], zoom_start=10, tiles="CartoDB positron")
    folium.Marker([weather['lat'], weather['lon']], tooltip=weather['city'], popup="City Location").add_to(folium_map)
    st_folium(folium_map, width=800, height=500)

    st.divider()

    # Rain prediction - Using sample code's style
    st.subheader("🌧️ Rain Prediction for Tomorrow")
    if forecast['rain_pred'] > 0.5:
        st.success("✅ Rain likely tomorrow. You can skip irrigation.")
    else:
        st.warning("⚠️ No rain expected. Plan irrigation accordingly.")

    st.divider()

    # Future temperature - Using sample code's style
    st.subheader("📈 Temperature Forecast (Next 5 Hours)")
    for hour, temp_val in zip(forecast['future_times'], forecast['future_temp']):
        st.write(f"**{hour}** → {round(temp_val, 1)}°C")

    st.divider()

    # Future humidity - Using sample code's style
    st.subheader("💧 Humidity Forecast (Next 5 Hours)")
    for hour, hum_val in zip(forecast['future_times'], forecast['future_hum']):
        st.write(f"**{hour}** → {round(hum_val, 1)}%")

# Instructions if no data yet
elif not st.session_state.weather_data:
    st.info("👈 Enter a city name and click 'Fetch Weather' to get started!")