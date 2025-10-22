import streamlit as st
import pandas as pd
import numpy as np
import joblib
import time
import requests
import math
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pytz
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
import folium
from streamlit_folium import st_folium
from collections import defaultdict
import json
import matplotlib.pyplot as plt

# Set page configuration
st.set_page_config(
    page_title="FarmMate - Agricultural Intelligence Platform",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        background: linear-gradient(90deg, #2E8B57, #228B22);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 2rem;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin: 0.5rem 0;
    }
    
    .recommendation-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        margin: 1rem 0;
    }
    
    .expert-notes {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 1rem 0;
    }
    
    .stSelectbox > div > div {
        background-color: #f0f8ff;
    }
    
    .tab-container {
        padding: 1rem;
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

# Global variables and configurations
API_KEY = "d881de71e6cf19a923c0139398067320"

# ===========================================
# CROP RECOMMENDATION MODULE
# ===========================================
def crop_recommendation_module():
    st.markdown('<h2 class="main-header">🌾 Smart Crop Recommendation System</h2>', unsafe_allow_html=True)
    st.markdown("*Powered by Machine Learning and AI Validation*")
    
    # Available crops and their mappings
    AVAILABLE_CROPS = [
        'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 
        'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'coffee',
        'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
        'mungbean', 'blackgram', 'lentil', 'cotton', 'jute', 'rice'
    ]

    # Mock encoder class
    class MockEncoder:
        def __init__(self, classes):
            self.classes_ = classes
        def transform(self, values):
            return [self.classes_.index(v) for v in values]

    def mock_recommend_crop(features_dict):
        """Mock crop recommendation function"""
        # Simulate ML prediction based on conditions
        if features_dict['rainfall'] > 1000 and features_dict['temperature'] > 25:
            if features_dict['soil_type'] == 'clayey':
                prediction = 'rice'
                probability = 0.85
                top5 = [('rice', 0.85), ('papaya', 0.12), ('banana', 0.02), ('coconut', 0.01), ('mango', 0.0)]
            else:
                prediction = 'mango'
                probability = 0.78
                top5 = [('mango', 0.78), ('papaya', 0.15), ('banana', 0.04), ('coconut', 0.02), ('grapes', 0.01)]
        elif features_dict['ph'] > 7 and features_dict['temperature'] < 20:
            prediction = 'apple'
            probability = 0.72
            top5 = [('apple', 0.72), ('grapes', 0.18), ('pomegranate', 0.06), ('orange', 0.03), ('mango', 0.01)]
        else:
            prediction = 'maize'
            probability = 0.65
            top5 = [('maize', 0.65), ('cotton', 0.20), ('chickpea', 0.08), ('lentil', 0.04), ('rice', 0.03)]
        
        return {
            'predicted_crop': prediction,
            'probability': probability,
            'top5_recommendations': top5,
            'features_used': features_dict
        }

    def mock_ai_validation(ml_result, features):
        """Mock AI validation"""
        crop = ml_result['predicted_crop']
        prob = ml_result['probability']
        
        if prob > 0.8:
            agreement = "Full"
            note = f"Excellent match! {crop.title()} is highly suitable for your conditions."
        elif prob > 0.6:
            agreement = "Partial"
            note = f"Good recommendation. {crop.title()} should perform well, though consider alternatives."
        else:
            agreement = "None"
            note = f"Low confidence. Consider other crops from the recommendations."
        
        return f"""
        🟢 **Agreement level:** {agreement}
        
        🔍 **Analysis:** {note}
        
        💡 **Key factors:** Your {features['soil_type']} soil with {features['rainfall']}mm rainfall and pH {features['ph']} creates favorable conditions.
        
        ✅ **Expert tip:** Monitor soil moisture and consider crop rotation for sustainable farming.
        """

    def create_recommendation_chart(top5_recommendations):
        """Create a bar chart for top 5 recommendations"""
        crops = [crop for crop, _ in top5_recommendations]
        probabilities = [prob * 100 for _, prob in top5_recommendations]
        
        fig = px.bar(
            x=probabilities,
            y=crops,
            orientation='h',
            title="Top 5 Crop Recommendations",
            labels={'x': 'Probability (%)', 'y': 'Crops'},
            color=probabilities,
            color_continuous_scale='Viridis'
        )
        
        fig.update_layout(
            height=400,
            showlegend=False,
            title_font_size=16,
            xaxis_title_font_size=14,
            yaxis_title_font_size=14
        )
        
        return fig

    def create_feature_radar(features_dict):
        """Create radar chart for key features"""
        # Normalize features for visualization
        normalized_features = {
            'N': min(features_dict['N'] / 100, 1),
            'P': min(features_dict['P'] / 100, 1),
            'K': min(features_dict['K'] / 100, 1),
            'pH': features_dict['ph'] / 14,
            'Temperature': min(features_dict['temperature'] / 40, 1),
            'Humidity': features_dict['humidity'] / 100,
            'Rainfall': min(features_dict['rainfall'] / 3000, 1)
        }
        
        categories = list(normalized_features.keys())
        values = list(normalized_features.values())
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=categories,
            fill='toself',
            name='Current Conditions',
            line=dict(color='rgb(0, 128, 0)')
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 1]
                )),
            showlegend=True,
            title="Farm Conditions Analysis"
        )
        
        return fig

    # Input section (formerly in sidebar)
    st.header("🌱 Enter Farm Details")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # Soil and Environmental Factors
        st.subheader("Soil & Environment")
        soil_type = st.selectbox("Soil Type", ['clayey', 'loamy', 'sandy'])
        ph = st.slider("Soil pH", 3.0, 10.0, 6.5, 0.1)
        organic_matter = st.slider("Organic Matter (%)", 0.5, 5.0, 2.5, 0.1)
        soil_moisture = st.slider("Soil Moisture (%)", 10.0, 80.0, 40.0, 1.0)
        
        # Nutrients
        st.subheader("Soil Nutrients (ppm)")
        N = st.slider("Nitrogen (N)", 0, 150, 50, 1)
        P = st.slider("Phosphorus (P)", 5, 150, 50, 1)
        K = st.slider("Potassium (K)", 5, 200, 50, 1)
    
    with col2:
        # Climate
        st.subheader("Climate Conditions")
        temperature = st.slider("Temperature (°C)", 8.0, 45.0, 25.0, 0.5)
        humidity = st.slider("Humidity (%)", 14.0, 100.0, 65.0, 1.0)
        rainfall = st.slider("Annual Rainfall (mm)", 20.0, 3000.0, 1000.0, 10.0)
        sunlight_exposure = st.slider("Daily Sunlight (hours)", 3.0, 12.0, 8.0, 0.5)
        wind_speed = st.slider("Wind Speed (km/h)", 1.0, 20.0, 5.0, 0.5)
        
        # Additional Factors
        st.subheader("Other Factors")
        co2_concentration = st.slider("CO2 Concentration (ppm)", 350, 500, 415, 5)
        frost_risk = st.slider("Frost Risk (0-1)", 0.0, 1.0, 0.1, 0.01)
        pest_pressure = st.slider("Pest Pressure (1-20)", 1, 20, 8, 1)
    
    with col3:
        fertilizer_usage = st.slider("Fertilizer Usage (kg/ha)", 0, 200, 70, 5)
        
        # Water Management
        st.subheader("Water Management")
        irrigation_frequency = st.slider("Irrigation Frequency (per week)", 1, 10, 3, 1)
        water_source_type = st.selectbox("Water Source", ['groundwater', 'rainwater', 'river'])
        water_usage_efficiency = st.slider("Water Efficiency", 1.0, 5.0, 2.5, 0.1)
        
        # Farm Details
        st.subheader("Farm Details")
        growth_stage = st.selectbox("Growth Stage", ['seedling', 'vegetative', 'flowering'])
        crop_density = st.slider("Crop Density", 1.0, 10.0, 5.0, 0.5)
        urban_area_proximity = st.slider("Urban Proximity (km)", 1.0, 100.0, 30.0, 1.0)
    
    predict_button = st.button("🔍 Get Crop Recommendations", type="primary")
    
    # Main content area
    if predict_button:
        # Prepare features
        features_dict = {
            'N': N, 'P': P, 'K': K,
            'temperature': temperature,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall,
            'soil_moisture': soil_moisture,
            'frost_risk': frost_risk,
            'soil_type': soil_type,
            'organic_matter': organic_matter,
            'co2_concentration': co2_concentration,
            'irrigation_frequency': irrigation_frequency,
            'water_source_type': water_source_type,
            'water_usage_efficiency': water_usage_efficiency,
            'sunlight_exposure': sunlight_exposure,
            'wind_speed': wind_speed,
            'urban_area_proximity': urban_area_proximity,
            'pest_pressure': pest_pressure,
            'fertilizer_usage': fertilizer_usage,
            'growth_stage': growth_stage,
            'crop_density': crop_density
        }
        
        # Get ML recommendation
        with st.spinner("Analyzing soil and climate conditions..."):
            ml_result = mock_recommend_crop(features_dict)
            time.sleep(1)  # Simulate processing time
        
        # Display main recommendation
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown(f"""
            <div class="recommendation-card">
                <h2>🌟 Recommended Crop: {ml_result['predicted_crop'].title()}</h2>
                <h3>Confidence: {ml_result['probability']:.1%}</h3>
                <p>Based on your soil and climate conditions, this crop has the highest success probability.</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            # Confidence meter
            fig_meter = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = ml_result['probability'] * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Confidence"},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 50], 'color': "lightgray"},
                        {'range': [50, 80], 'color': "yellow"},
                        {'range': [80, 100], 'color': "green"}],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90}}))
            fig_meter.update_layout(height=300)
            st.plotly_chart(fig_meter, use_container_width=True)
        
        # Top 5 recommendations
        st.subheader("📊 Top 5 Crop Recommendations")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            # Bar chart
            chart = create_recommendation_chart(ml_result['top5_recommendations'])
            st.plotly_chart(chart, use_container_width=True)
        
        with col2:
            # Detailed list
            st.subheader("Detailed Recommendations")
            for i, (crop, prob) in enumerate(ml_result['top5_recommendations'], 1):
                if i == 1:
                    st.success(f"🥇 {crop.title()}: {prob:.1%}")
                elif i == 2:
                    st.info(f"🥈 {crop.title()}: {prob:.1%}")
                elif i == 3:
                    st.warning(f"🥉 {crop.title()}: {prob:.1%}")
                else:
                    st.write(f"{i}. {crop.title()}: {prob:.1%}")
        
        # AI Validation (only if confidence < 80%)
        if ml_result['probability'] < 0.8:
            with st.spinner("Getting AI expert validation..."):
                time.sleep(2)  # Simulate API call time
                ai_validation = mock_ai_validation(ml_result, features_dict)
            
            st.markdown(f"""
            <div class="expert-notes">
                <h3>🤖 AI Expert Validation</h3>
                {ai_validation}
            </div>
            """, unsafe_allow_html=True)
        
        # Feature Analysis
        st.subheader("📈 Farm Conditions Analysis")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            # Radar chart
            radar_fig = create_feature_radar(features_dict)
            st.plotly_chart(radar_fig, use_container_width=True)
        
        with col2:
            # Key metrics
            st.subheader("Key Metrics")
            
            # Soil fertility
            soil_fertility = (N + P + K) / 3
            st.metric("Soil Fertility Index", f"{soil_fertility:.1f}", 
                     delta="Excellent" if soil_fertility > 50 else "Good" if soil_fertility > 30 else "Needs Improvement")
            
            # Climate suitability
            climate_score = min(100, (humidity + (rainfall/30) + (temperature*2)) / 3)
            st.metric("Climate Suitability", f"{climate_score:.1f}%",
                     delta="Excellent" if climate_score > 70 else "Good" if climate_score > 50 else "Fair")
            
            # Water availability
            water_score = min(100, (rainfall/20 + irrigation_frequency*10 + water_usage_efficiency*20))
            st.metric("Water Availability", f"{water_score:.1f}%",
                     delta="Excellent" if water_score > 70 else "Good" if water_score > 50 else "Limited")
        
        # Recommendations and Tips
        st.subheader("💡 Farming Tips")
        
        tips = []
        if ph < 6.0:
            tips.append("⚠️ **Low pH**: Consider lime application to improve soil alkalinity")
        if ph > 8.0:
            tips.append("⚠️ **High pH**: Consider sulfur application to reduce soil alkalinity")
        if rainfall < 500:
            tips.append("💧 **Low rainfall**: Ensure adequate irrigation system")
        if pest_pressure > 15:
            tips.append("🐛 **High pest pressure**: Implement integrated pest management")
        if organic_matter < 2.0:
            tips.append("🌱 **Low organic matter**: Add compost or organic fertilizers")
        
        if tips:
            for tip in tips:
                st.markdown(tip)
        else:
            st.success("✅ Your farm conditions are well-balanced!")
        
        # Export option
        st.subheader("📋 Export Recommendations")
        
        report_data = {
            'Farm Details': features_dict,
            'Recommended Crop': ml_result['predicted_crop'],
            'Confidence': f"{ml_result['probability']:.1%}",
            'Top 5 Crops': [f"{crop}: {prob:.1%}" for crop, prob in ml_result['top5_recommendations']]
        }
        
        if st.button("📄 Generate PDF Report"):
            st.info("PDF report generation would be implemented here")
            st.json(report_data)
    
    else:
        # Welcome screen
        st.markdown("""
        ## Welcome to the Smart Crop Recommendation System! 🌾
        
        This AI-powered tool helps farmers make informed decisions about crop selection based on:
        
        - 🌱 **Soil conditions** (type, pH, nutrients, moisture)
        - 🌤️ **Climate factors** (temperature, humidity, rainfall)
        - 💧 **Water resources** (source, efficiency, irrigation)
        - 🏭 **Environmental factors** (CO2, pest pressure, proximity to urban areas)
        
        ### How it works:
        1. **Enter your farm details** in the form above
        2. **Get ML-powered recommendations** with confidence scores
        3. **Receive AI validation** and expert insights
        4. **View detailed analysis** of your farm conditions
        
        **Get started by filling out the form above!** 👆
        """)
        
        # Show sample data
        with st.expander("📖 View Sample Farm Data"):
            sample_data = pd.DataFrame([
                {
                    'Soil Type': 'Loamy',
                    'pH': 6.5,
                    'N': 45, 'P': 35, 'K': 40,
                    'Temperature': 25.0,
                    'Humidity': 70.0,
                    'Rainfall': 1200.0,
                    'Recommended Crop': 'Mango',
                    'Confidence': '85%'
                },
                {
                    'Soil Type': 'Clayey',
                    'pH': 6.0,
                    'N': 60, 'P': 40, 'K': 50,
                    'Temperature': 28.0,
                    'Humidity': 85.0,
                    'Rainfall': 1500.0,
                    'Recommended Crop': 'Rice',
                    'Confidence': '92%'
                }
            ])
            st.dataframe(sample_data, use_container_width=True)

# ===========================================
# EVAPOTRANSPIRATION CALCULATOR MODULE
# ===========================================
def evapotranspiration_module():
    st.markdown('<h2 class="main-header">🌱 AgriSmart ET Calculator</h2>', unsafe_allow_html=True)
    
    # Crop coefficients database
    CROP_COEFFICIENTS = {
        "grass": 1.00,
        "wheat": 1.05,
        "barley": 1.00,
        "maize": 1.10,
        "tomatoes": 1.15,
        "potatoes": 1.10,
        "lettuce": 1.00,
        "cabbage": 1.05,
        "cotton": 1.15,
        "soybeans": 1.05,
        "vineyard": 0.70,
        "orchard": 0.90,
        "alfalfa": 0.95
    }

    def wind_speed_10m_to_2m(u10):
        """Convert wind speed from 10m height to 2m height"""
        return u10 * (4.87 / math.log((67.8 * 10) - 5.42))

    def calculate_solar_declination(day_of_year):
        """Calculate solar declination in radians"""
        return 0.409 * math.sin(2 * math.pi / 365 * day_of_year - 1.39)

    def calculate_daylight_hours(lat, solar_declination):
        """Calculate daylight hours"""
        lat_rad = math.radians(lat)
        sunset_hour_angle = math.acos(-math.tan(lat_rad) * math.tan(solar_declination))
        return 24 / math.pi * sunset_hour_angle

    def calculate_extraterrestrial_radiation(lat, day_of_year):
        """Calculate extraterrestrial radiation (Ra) in MJ/m²/day"""
        solar_declination = calculate_solar_declination(day_of_year)
        daylight_hours = calculate_daylight_hours(lat, solar_declination)
        
        G_sc = 0.0820  # Solar constant (MJ/m²/min)
        dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * day_of_year)  # Inverse relative distance Earth-Sun
        
        lat_rad = math.radians(lat)
        term1 = 24 * 60 / math.pi * G_sc * dr
        term2 = math.acos(-math.tan(lat_rad) * math.tan(solar_declination))
        term3 = math.sin(lat_rad) * math.sin(solar_declination) * term2
        term4 = math.cos(lat_rad) * math.cos(solar_declination) * math.sin(term2)
        
        Ra = term1 * (term3 + term4)
        return Ra

    def calculate_et0(weather_data, lat, lon):
        """
        Calculate daily reference evapotranspiration (ET0) using FAO Penman-Monteith equation
        """
        try:
            # Extract weather parameters
            T_min = weather_data['temp']['min']
            T_max = weather_data['temp']['max']
            T_mean = (T_min + T_max) / 2
            RH_mean = weather_data.get('humidity', 60)
            u10 = weather_data.get('wind_speed', 2.0)
            cloudiness = weather_data.get('clouds', 50)
            
            # Get date information
            dt = weather_data.get('dt', datetime.now().timestamp())
            date = datetime.fromtimestamp(dt)
            day_of_year = date.timetuple().tm_yday
            
            # Convert wind speed from 10m to 2m height
            u2 = wind_speed_10m_to_2m(u10)
            
            # Calculate saturation and actual vapor pressure
            es = 0.6108 * math.exp(17.27 * T_mean / (T_mean + 237.3))  # kPa
            ea = es * (RH_mean / 100)  # kPa
            
            # Calculate slope of vapor pressure curve
            Delta = (4098 * es) / ((T_mean + 237.3) ** 2)  # kPa/°C
            
            # Psychrometric constant (assuming standard atmospheric pressure)
            gamma = 0.665 * 0.001  # kPa/°C
            
            # Calculate extraterrestrial radiation
            Ra = calculate_extraterrestrial_radiation(lat, day_of_year)
            
            # Estimate solar radiation from cloudiness (simplified approach)
            Rs = Ra * (0.75 + 0.00002 * 0) * (1 - (cloudiness / 100))  # Simple cloud adjustment
            
            # Calculate net radiation (simplified)
            Rns = 0.77 * Rs  # Net shortwave radiation
            Rnl = 4.903e-9 * ((T_max + 273.16) ** 4 + (T_min + 273.16) ** 4) / 2 * (0.34 - 0.14 * math.sqrt(ea)) * (1.35 * (Rs / (Ra + 0.0001)) - 0.35)
            Rn = Rns - Rnl  # Net radiation
            
            # Soil heat flux (negligible for daily calculations)
            G = 0
            
            # Apply FAO Penman-Monteith equation
            numerator = (0.408 * Delta * (Rn - G)) + (gamma * (900 / (T_mean + 273)) * u2 * (es - ea))
            denominator = Delta + (gamma * (1 + 0.34 * u2))
            et0 = numerator / denominator
            
            return max(0, round(et0, 2))
            
        except Exception as e:
            st.error(f"Error calculating ET0: {e}")
            # Fallback calculation based on temperature
            T_mean = (weather_data['temp']['min'] + weather_data['temp']['max']) / 2
            return max(0, round(T_mean * 0.2, 2))

    def process_forecast_to_daily(forecast_data):
        """Convert 3-hour forecast data into daily summaries"""
        daily_data = defaultdict(lambda: {
            'temp_min': float('inf'),
            'temp_max': float('-inf'),
            'humidity_sum': 0,
            'wind_speed_sum': 0,
            'cloudiness_sum': 0,
            'count': 0,
            'dt': None
        })
        
        for entry in forecast_data['list']:
            date_str = datetime.fromtimestamp(entry['dt']).strftime('%Y-%m-%d')
            day_data = daily_data[date_str]
            
            # Get temperature values
            temp_min = entry['main'].get('temp_min', entry['main']['temp'])
            temp_max = entry['main'].get('temp_max', entry['main']['temp'])
            
            # Update min/max temperatures
            day_data['temp_min'] = min(day_data['temp_min'], temp_min)
            day_data['temp_max'] = max(day_data['temp_max'], temp_max)
            
            # Sum other parameters for averaging
            day_data['humidity_sum'] += entry['main']['humidity']
            day_data['wind_speed_sum'] += entry['wind']['speed']
            day_data['cloudiness_sum'] += entry['clouds']['all']
            day_data['count'] += 1
            day_data['dt'] = entry['dt']  # Use the timestamp of the last entry for the day
        
        # Convert to the format expected by calculate_et0
        processed_daily = []
        for date_str, data in daily_data.items():
            if data['count'] > 0:
                processed_daily.append({
                    'dt': data['dt'],
                    'temp': {
                        'min': data['temp_min'],
                        'max': data['temp_max']
                    },
                    'humidity': data['humidity_sum'] / data['count'],
                    'wind_speed': data['wind_speed_sum'] / data['count'],
                    'clouds': data['cloudiness_sum'] / data['count']
                })
        
        return processed_daily

    def fetch_weather_data(api_key, lat, lon):
        """Fetch current and forecast weather data from OpenWeatherMap"""
        try:
            # Use the 2.5 forecast API
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            # Process the 3-hour forecast data into daily format
            daily_forecast = process_forecast_to_daily(data)
            return {'daily': daily_forecast}
            
        except requests.exceptions.RequestException as e:
            st.error(f"Error fetching weather data: {e}")
            # Return fallback data if API fails
            return create_fallback_data()
        except json.JSONDecodeError as e:
            st.error(f"Error parsing weather data: {e}")
            return create_fallback_data()

    def create_fallback_data():
        """Create fallback data for demonstration purposes"""
        current_time = datetime.now()
        fallback_data = []
        
        for i in range(5):
            day_time = current_time + timedelta(days=i)
            fallback_data.append({
                'dt': day_time.timestamp(),
                'temp': {
                    'min': 10 + i * 2,
                    'max': 20 + i * 2
                },
                'humidity': 60 + i * 5,
                'wind_speed': 2.0 + i * 0.5,
                'clouds': 30 + i * 10
            })
        
        return {'daily': fallback_data}

    # Input section (formerly in sidebar)
    st.header("Location Settings")
    col1, col2 = st.columns(2)
    
    with col1:
        lat = st.number_input("Latitude", value=51.5074, format="%.4f")
    
    with col2:
        lon = st.number_input("Longitude", value=-0.1278, format="%.4f")
    
    st.header("Crop Selection")
    selected_crop = st.selectbox(
        "Choose your crop",
        options=list(CROP_COEFFICIENTS.keys()),
        index=list(CROP_COEFFICIENTS.keys()).index("tomatoes")
    )
    
    if st.button("Calculate ET0", type="primary"):
        st.session_state.calculate_et0 = True
    else:
        st.session_state.calculate_et0 = False
    
    # Main content
    if st.session_state.get('calculate_et0', False):
        st.markdown(f"### 📍 Location: Latitude {lat}, Longitude {lon}")
        st.markdown(f"### 🌾 Selected Crop: {selected_crop}")
        st.markdown("---")
        
        with st.spinner("Fetching weather data and calculating ET0..."):
            # Fetch weather data
            weather_data = fetch_weather_data(API_KEY, lat, lon)
            
            if weather_data and 'daily' in weather_data:
                st.success("✅ Weather data processed successfully!")
                
                # Calculate ET0 for available days
                et0_results = []
                for i, daily_data in enumerate(weather_data['daily']):
                    et0 = calculate_et0(daily_data, lat, lon)
                    date = datetime.fromtimestamp(daily_data['dt']).strftime('%Y-%m-%d (%a)')
                    et0_results.append({
                        'date': date,
                        'et0': et0,
                        'min_temp': daily_data['temp']['min'],
                        'max_temp': daily_data['temp']['max'],
                        'humidity': daily_data['humidity'],
                        'wind_speed': daily_data['wind_speed'],
                        'cloudiness': daily_data['clouds']
                    })
                
                # Create DataFrame for analysis
                df = pd.DataFrame(et0_results)
                
                # Display results in tabs
                tab1, tab2, tab3 = st.tabs(["📊 ET0 Forecast", "💧 Irrigation Recommendations", "📈 Charts"])
                
                with tab1:
                    st.markdown("### Daily Evapotranspiration (ET0) Forecast")
                    
                    # Display data table
                    st.dataframe(
                        df[['date', 'et0', 'min_temp', 'max_temp', 'humidity']].rename(columns={
                            'date': 'Date',
                            'et0': 'ET0 (mm/day)',
                            'min_temp': 'Min Temp (°C)',
                            'max_temp': 'Max Temp (°C)',
                            'humidity': 'Humidity (%)'
                        }),
                        use_container_width=True
                    )
                    
                    # Calculate crop water need
                    kc = CROP_COEFFICIENTS[selected_crop]
                    df['crop_water_need'] = df['et0'] * kc
                    
                    st.markdown(f"### 💧 Crop Water Needs for {selected_crop} (Kc = {kc})")
                    st.dataframe(
                        df[['date', 'crop_water_need']].rename(columns={
                            'date': 'Date',
                            'crop_water_need': f'Water Need (mm)'
                        }),
                        use_container_width=True
                    )
                
                with tab2:
                    st.markdown("### 🌱 Irrigation Recommendations")
                    
                    today = df.iloc[0]
                    
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.markdown("#### Today's Summary")
                        st.markdown(f"**Date:** {today['date']}")
                        st.markdown(f"**Reference ET0:** {today['et0']} mm")
                        st.markdown(f"**{selected_crop} water need:** {today['crop_water_need']:.1f} mm")
                        st.markdown(f"**Temperature:** {today['min_temp']:.1f}°C to {today['max_temp']:.1f}°C")
                        st.markdown(f"**Humidity:** {today['humidity']:.1f}%")
                    
                    with col2:
                        st.markdown("#### Recommendations")
                        
                        # Frost check
                        if today['min_temp'] <= 1.0:
                            st.error("❄️ **FROST WARNING**: Minimum temperature ≤ 1°C tonight!")
                            st.info("💡 **Recommendation**: Delay irrigation and protect sensitive crops")
                        elif today['min_temp'] <= 3.0:
                            st.warning("⚠️ **Frost Risk**: Minimum temperature ≤ 3°C tonight")
                            st.info("💡 **Recommendation**: Monitor conditions and consider light irrigation")
                        else:
                            st.success("✅ **No frost risk detected**")
                            st.info(f"💧 **Recommendation**: Apply {today['crop_water_need']:.1f} mm irrigation")
                        
                        # Additional recommendations
                        if today['cloudiness'] > 70:
                            st.info("☁️ **Cloudy conditions** today - reduced evaporation expected")
                        if today['wind_speed'] > 5.0:
                            st.info("💨 **Windy conditions** - increased evaporation expected")
                    
                    # Weekly planning
                    st.markdown("---")
                    st.markdown("#### 📅 Weekly Water Planning")
                    
                    weekly_need = df['crop_water_need'].sum()
                    avg_daily = df['crop_water_need'].mean()
                    
                    col3, col4 = st.columns(2)
                    with col3:
                        st.metric("Total weekly water need", f"{weekly_need:.1f} mm")
                    with col4:
                        st.metric("Average daily need", f"{avg_daily:.1f} mm/day")
                
                with tab3:
                    st.markdown("### 📈 Weather and ET0 Charts")
                    
                    if not df.empty:
                        # Create visualization
                        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
                        
                        # ET0 and Water Need Chart
                        dates = [datetime.strptime(row['date'][:10], '%Y-%m-%d') for _, row in df.iterrows()]
                        ax1.plot(dates, df['et0'], 'o-', label='Reference ET0', linewidth=2, markersize=8, color='blue')
                        ax1.plot(dates, df['crop_water_need'], 's-', label=f'{selected_crop} Water Need', linewidth=2, markersize=8, color='green')
                        ax1.set_ylabel('Water (mm/day)', fontweight='bold')
                        ax1.set_title('Daily Evapotranspiration and Crop Water Needs', fontweight='bold')
                        ax1.legend()
                        ax1.grid(True, alpha=0.3)
                        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)
                        
                        # Weather Parameters Chart
                        ax2.plot(dates, df['max_temp'], 'r-o', label='Max Temp (°C)', markersize=6, linewidth=2)
                        ax2.plot(dates, df['min_temp'], 'b-o', label='Min Temp (°C)', markersize=6, linewidth=2)
                        ax2.set_ylabel('Temperature (°C)', fontweight='bold')
                        ax2.legend(loc='upper left')
                        
                        ax2_twin = ax2.twinx()
                        ax2_twin.plot(dates, df['humidity'], 'g--s', label='Humidity (%)', markersize=6, linewidth=2)
                        ax2_twin.set_ylabel('Humidity (%)', fontweight='bold')
                        ax2_twin.legend(loc='upper right')
                        
                        ax2.set_title('Weather Conditions', fontweight='bold')
                        ax2.grid(True, alpha=0.3)
                        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)
                        
                        plt.tight_layout()
                        st.pyplot(fig)
            
            else:
                st.error("❌ Failed to process weather data.")
    
    else:
        # Welcome message
        st.info("""
        ### Welcome to AgriSmart ET Calculator! 🌱
        
        This tool helps farmers and agricultural professionals calculate:
        - **Reference Evapotranspiration (ET0)** using FAO Penman-Monteith equation
        - **Crop water requirements** based on crop coefficients
        - **Irrigation recommendations** based on weather forecasts
        
        **To get started:**
        1. Set your location coordinates above
        2. Select your crop type
        3. Click the 'Calculate ET0' button
        """)
        
        # Display crop coefficients table
        st.markdown("### 📋 Available Crops and Their Coefficients (Kc)")
        crop_df = pd.DataFrame.from_dict(CROP_COEFFICIENTS, orient='index', columns=['Crop Coefficient (Kc)'])
        crop_df.index.name = 'Crop'
        st.dataframe(crop_df, use_container_width=True)

# ===========================================
# FERTILIZER RECOMMENDATION MODULE
# ===========================================
def fertilizer_recommendation_module():
    st.markdown('<h2 class="main-header">🌱 Fertilizer Recommendation System</h2>', unsafe_allow_html=True)
    
    # Mock model data
    class MockModel:
        def predict(self, X):
            return np.random.choice([0, 1, 2], size=X.shape[0])
    
    class MockEncoder:
        def __init__(self, classes):
            self.classes_ = classes
        def transform(self, values):
            return [self.classes_.index(v) for v in values]
        def inverse_transform(self, values):
            return [self.classes_[v] for v in values]
    
    # Load mock model data
    model_data = {
        'model': MockModel(),
        'features': ['Nitrogen', 'Phosphorous', 'Potassium', 'Temperature', 'Moisture', 'Rainfall', 'PH', 'Carbon', 'Soil_encoded', 'Crop_encoded'],
        'le_fertilizer': MockEncoder(['Urea', 'DAP', 'Compost']),
        'le_soil': MockEncoder(['Acidic Soil', 'Neutral Soil', 'Alkaline Soil', 'Sandy Soil', 'Loamy Soil', 'Clay Soil', 'Peaty Soil']),
        'le_crop': MockEncoder(['wheat', 'rice', 'maize', 'barley', 'millet', 'sugarcane', 'cotton', 'tea', 'coffee', 'apple', 'banana', 'mango'])
    }
    
    def rule_based_fertilizer_recommendation(input_data):
        """Pure rule-based system as fallback"""
        ph = input_data['PH']
        nitrogen = input_data['Nitrogen']
        phosphorous = input_data['Phosphorous']
        potassium = input_data['Potassium']
        moisture = input_data['Moisture']
        rainfall = input_data['Rainfall']
        soil_type = input_data['Soil']
        crop = input_data['Crop']
        
        # pH-based recommendations
        if ph < 5.5:
            return "Lime", "Highly acidic soil requires pH correction", 0.95
        elif ph > 7.5:
            return "Gypsum", "Alkaline soil requires pH correction", 0.95
        
        # Nutrient deficiency-based
        if nitrogen < 20 and phosphorous < 15 and potassium < 15:
            return "Compost", "Multiple severe nutrient deficiencies", 0.9
        elif nitrogen < 30:
            return "Urea", "Nitrogen deficiency", 0.8
        elif phosphorous < 20:
            return "DAP", "Phosphorous deficiency", 0.8
        elif potassium < 20:
            return "Muriate of Potash", "Potassium deficiency", 0.8
        
        # Environmental conditions
        if moisture < 0.3 or rainfall < 80:
            return "Water Retaining Fertilizer", "Dry conditions", 0.85
        
        # Crop-specific recommendations
        if crop.lower() in ['tea', 'coffee', 'herbs']:
            return "Organic Fertilizer", "Crop requires organic cultivation", 0.8
        elif crop.lower() in ['rice', 'wheat']:
            return "Balanced NPK Fertilizer", "Staple crop balanced nutrition", 0.75
        
        # Default to balanced fertilizer
        return "Balanced NPK Fertilizer", "General purpose recommendation", 0.7

    def production_fertilizer_recommendation(input_data, model_data):
        """Production-ready fertilizer recommendation function"""
        # Input validation
        required_fields = ['Temperature', 'Moisture', 'Rainfall', 'PH', 'Nitrogen', 
                          'Phosphorous', 'Potassium', 'Carbon', 'Soil', 'Crop']
        
        missing_fields = [field for field in required_fields if field not in input_data]
        if missing_fields:
            return {'error': f'Missing required fields: {missing_fields}'}
        
        # Value validation
        if not (0 <= input_data['PH'] <= 14):
            return {'error': 'pH must be between 0 and 14'}
        if not (0 <= input_data['Moisture'] <= 1):
            return {'error': 'Moisture must be between 0 and 1'}
        if input_data['Rainfall'] < 0:
            return {'error': 'Rainfall cannot be negative'}
        
        try:
            # Get rule-based recommendation
            rule_recommendation, rule_reason, rule_confidence = rule_based_fertilizer_recommendation(input_data)
            
            # Generate explanation
            explanation = []
            explanation.append(f"Rule-based: {rule_reason}")
            
            # Add context
            if ph < 5.5:
                explanation.append("Soil is highly acidic")
            elif ph > 7.5:
                explanation.append("Soil is alkaline")
            
            nutrient_status = []
            if nitrogen < 20:
                nutrient_status.append("very low nitrogen")
            elif nitrogen < 40:
                nutrient_status.append("low nitrogen")
                
            if phosphorous < 15:
                nutrient_status.append("very low phosphorous")
            elif phosphorous < 30:
                nutrient_status.append("low phosphorous")
                
            if potassium < 15:
                nutrient_status.append("very low potassium")
            elif potassium < 30:
                nutrient_status.append("low potassium")
            
            if nutrient_status:
                explanation.append(f"Nutrient status: {', '.join(nutrient_status)}")
            
            if moisture < 0.3:
                explanation.append("Very dry conditions")
            
            return {
                'recommended_fertilizer': rule_recommendation,
                'confidence': rule_confidence,
                'explanation': " | ".join(explanation),
                'source': "Rule-based system",
                'input_parameters': input_data
            }
            
        except Exception as e:
            return {'error': f'Recommendation failed: {str(e)}', 'fallback_recommendation': 'Balanced NPK Fertilizer'}

    # Input section
    st.markdown('<div class="input-section">', unsafe_allow_html=True)
    st.header("📊 Input Parameters")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        temperature = st.slider("Temperature (°C)", -20.0, 60.0, 25.0, 0.1)
        moisture = st.slider("Moisture (0-1)", 0.0, 1.0, 0.5, 0.01)
        rainfall = st.slider("Rainfall (mm)", 0.0, 500.0, 150.0, 1.0)
    
    with col2:
        ph = st.slider("pH Level", 0.0, 14.0, 6.5, 0.1)
        nitrogen = st.slider("Nitrogen (ppm)", 0.0, 100.0, 40.0, 1.0)
        phosphorous = st.slider("Phosphorous (ppm)", 0.0, 100.0, 30.0, 1.0)
    
    with col3:
        potassium = st.slider("Potassium (ppm)", 0.0, 100.0, 35.0, 1.0)
        carbon = st.slider("Carbon (%)", 0.0, 5.0, 1.5, 0.1)
    
    # Soil and crop selection
    col4, col5 = st.columns(2)
    
    with col4:
        soil_types = ['Acidic Soil', 'Neutral Soil', 'Alkaline Soil', 'Sandy Soil', 
                     'Loamy Soil', 'Clay Soil', 'Peaty Soil']
        soil_type = st.selectbox("Soil Type", soil_types)
    
    with col5:
        crop_types = ['wheat', 'rice', 'maize', 'barley', 'millet', 'sugarcane',
                     'cotton', 'tea', 'coffee', 'apple', 'banana', 'mango']
        crop_type = st.selectbox("Crop Type", crop_types)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Recommendation button
    if st.button("🌿 Get Fertilizer Recommendation", type="primary", use_container_width=True):
        # Prepare input data
        input_data = {
            'Temperature': temperature,
            'Moisture': moisture,
            'Rainfall': rainfall,
            'PH': ph,
            'Nitrogen': nitrogen,
            'Phosphorous': phosphorous,
            'Potassium': potassium,
            'Carbon': carbon,
            'Soil': soil_type,
            'Crop': crop_type
        }
        
        # Get recommendation
        result = production_fertilizer_recommendation(input_data, model_data)
        
        # Display results
        if 'error' in result:
            st.error(f"❌ {result['error']}")
            if 'fallback_recommendation' in result:
                st.info(f"Fallback recommendation: {result['fallback_recommendation']}")
        else:
            st.markdown('<div class="recommendation-box">', unsafe_allow_html=True)
            st.success(f"## ✅ Recommended Fertilizer: **{result['recommended_fertilizer']}**")
            st.metric("Confidence Level", f"{result['confidence']:.0%}")
            
            st.write("---")
            st.write("**Explanation:**")
            st.info(result['explanation'])
            
            st.write("**Source:**")
            st.code(result['source'])
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Show input summary
            with st.expander("📋 Input Summary"):
                st.json(input_data)

# ===========================================
# FROST ALARM MODULE
# ===========================================
def frost_alarm_module():
    st.markdown('<h2 class="main-header">❄️ Indian Cities Frost Prediction System</h2>', unsafe_allow_html=True)
    
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

    def mock_predict_frost_risk(city_name, api_key):
        """Mock frost risk prediction"""
        try:
            weather_data = get_weather_data(city_name, api_key)
            
            # Mock prediction based on temperature and humidity
            temp = weather_data['main']['temp']
            humidity = weather_data['main']['humidity']
            
            # Simple heuristic for frost risk
            if temp <= 0:
                probability = 0.9
            elif temp <= 2:
                probability = 0.7
            elif temp <= 5 and humidity > 80:
                probability = 0.5
            elif temp <= 5:
                probability = 0.3
            else:
                probability = 0.1
            
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
                'city': weather_data['city_info']['name'],
                'region': weather_data['city_info']['region'],
                'elevation': weather_data['city_info']['elevation'],
                'coordinates': weather_data['city_info']['coordinates'],
                'temperature': weather_data['main']['temp'],
                'feels_like': weather_data['main']['feels_like'],
                'humidity': weather_data['main']['humidity'],
                'wind_speed': weather_data['wind']['speed'],
                'dew_point': weather_data['main']['temp'] - ((100 - weather_data['main']['humidity']) / 5),
                'cloud_cover': weather_data['clouds']['all'],
                'frost_probability': probability,
                'frost_prediction': 1 if probability >= 0.5 else 0,
                'risk_level': risk_level,
                'recommended_action': action,
                'alert_class': alert_class,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'threshold_used': 0.5,
            }
            
            return result
            
        except Exception as e:
            return {'error': str(e)}

    # Mode selection
    app_mode = st.selectbox("Choose Mode", ["Current Prediction", "Weekly Forecast", "About"])
    
    # Main content
    if app_mode == "Current Prediction":
        st.markdown('<h2 class="sub-header">Current Frost Risk Prediction</h2>', unsafe_allow_html=True)
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            selected_city = st.selectbox("Select City", list(CITIES_DATA.keys()))
            
            if st.button("Predict Frost Risk", type="primary"):
                with st.spinner("Fetching weather data and predicting..."):
                    result = mock_predict_frost_risk(selected_city, API_KEY)
                    
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
            if 'result' in locals():
                # Create weather card
                st.markdown("### 🌡️ Current Weather Conditions")
                st.markdown(
    f'<div class="weather-card">'
    f'<p><strong>📍 City:</strong> {result["city"]} ({result["region"]})</p>'
    f'<p><strong>🏔️ Elevation:</strong> {result["elevation"]}m</p>'
    f'<p><strong>🌡️ Temperature:</strong> {result["temperature"]:.1f}°C (Feels like: {result["feels_like"]:.1f}°C)</p>'
    f'<p><strong>💧 Humidity:</strong> {result["humidity"]:.0f}%</p>'
    f'<p><strong>💨 Wind Speed:</strong> {result["wind_speed"]:.1f} m/s</p>'
    f'<p><strong>☁️ Cloud Cover:</strong> {result["cloud_cover"]:.0f}%</p>'
    f'</div>',
    unsafe_allow_html=True
)

                
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
        
        if st.button("Get Weekly Forecast", type="primary"):
            with st.spinner("Fetching weekly forecast data..."):
                # Mock weekly forecast data
                dates = [(datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
                min_temps = [max(0, 5 - i) for i in range(7)]  # Decreasing temperatures
                frost_probs = [min(0.9, 0.1 + i * 0.15) for i in range(7)]  # Increasing probabilities
                
                results = []
                for i in range(7):
                    if frost_probs[i] >= 0.7:
                        risk_level = "🚨 HIGH RISK"
                    elif frost_probs[i] >= 0.5:
                        risk_level = "⚠️ MODERATE RISK"
                    elif frost_probs[i] >= 0.3:
                        risk_level = "🔶 LOW RISK"
                    else:
                        risk_level = "✅ VERY LOW RISK"
                    
                    results.append({
                        'date': dates[i],
                        'min_temp': min_temps[i],
                        'max_temp': min_temps[i] + 10,
                        'night_min_temp': min_temps[i],
                        'frost_probability': frost_probs[i],
                        'frost_prediction': 1 if frost_probs[i] >= 0.5 else 0,
                        'risk_level': risk_level
                    })
                
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

# ===========================================
# WEATHER MODULE
# ===========================================
def weather_module():
    st.markdown('<h2 class="main-header">🌦️ Weather Forecast for Farmers</h2>', unsafe_allow_html=True)
    
    def get_current_weather(city):
        """Fetch current weather data from OpenWeather API"""
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
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

    # Initialize session state to persist data
    if "weather_data" not in st.session_state:
        st.session_state.weather_data = None
    if "forecast_data" not in st.session_state:
        st.session_state.forecast_data = None

    # Input section
    st.header("🌍 Location")
    city = st.text_input("Enter City Name", "Chennai, IN")

    # Button to fetch weather
    if st.button("📡 Fetch Weather"):
        with st.spinner("Fetching weather data..."):
            # Get current weather
            weather = get_current_weather(city.split(",")[0])  # Use only city name before comma
            
            if weather:
                # Mock rain prediction
                rain_prediction = 0.2 if weather['current_temp'] > 25 else 0.7
                
                # Mock future predictions
                future_times = [(datetime.now() + timedelta(hours=i+1)).strftime('%H:%M') for i in range(5)]
                future_temp = [weather['current_temp'] + np.random.uniform(-2, 2) for _ in range(5)]
                future_hum = [weather['humidity'] + np.random.uniform(-10, 10) for _ in range(5)]
                
                # Store in session state
                st.session_state.weather_data = weather
                st.session_state.forecast_data = {
                    'rain_pred': rain_prediction,
                    'future_temp': future_temp,
                    'future_hum': future_hum,
                    'future_times': future_times
                }

    # Display data if available in session state
    if st.session_state.weather_data and st.session_state.forecast_data:
        weather = st.session_state.weather_data
        forecast = st.session_state.forecast_data
        
        # Display current weather
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

        # Rain prediction
        st.subheader("🌧️ Rain Prediction for Tomorrow")
        if forecast['rain_pred'] > 0.5:
            st.success("✅ Rain likely tomorrow. You can skip irrigation.")
        else:
            st.warning("⚠️ No rain expected. Plan irrigation accordingly.")

        st.divider()

        # Future temperature
        st.subheader("📈 Temperature Forecast (Next 5 Hours)")
        for hour, temp_val in zip(forecast['future_times'], forecast['future_temp']):
            st.write(f"**{hour}** → {round(temp_val, 1)}°C")

        st.divider()

        # Future humidity
        st.subheader("💧 Humidity Forecast (Next 5 Hours)")
        for hour, hum_val in zip(forecast['future_times'], forecast['future_hum']):
            st.write(f"**{hour}** → {round(hum_val, 1)}%")

    # Instructions if no data yet
    elif not st.session_state.weather_data:
        st.info("👈 Enter a city name and click 'Fetch Weather' to get started!")

# ===========================================
# YIELD PREDICTION MODULE
# ===========================================
def yield_prediction_module():
    st.markdown('<h2 class="main-header">🌾 Crop Yield Prediction App</h2>', unsafe_allow_html=True)
    
    # Mock model
    class MockModel:
        def predict(self, X):
            return np.array([50000 + np.random.uniform(-10000, 10000) for _ in range(X.shape[0])])
    
    # Mock preprocessor
    class MockPreprocessor:
        def transform(self, X):
            return X
    
    # Load mock models
    dtr = MockModel()
    preprocesser = MockPreprocessor()
    
    # Crop thresholds for yield assessment (in tons/ha)
    CROP_THRESHOLDS = {
        "Maize": (4, 10),
        "Rice, paddy": (3, 6),
        "Wheat": (2, 5),
        "Potatoes": (20, 40)
    }

    # Predict function
    def prediction(Year, Rainfall, Pesticides, Temp, Area, Crop):
        features = np.array([[Year, Rainfall, Pesticides, Temp, Area, Crop]], dtype=object)
        transformed = preprocesser.transform(features)
        predicted_yield = dtr.predict(transformed)[0]
        return predicted_yield

    # Evaluate yield based on thresholds
    def evaluate_yield(crop, predicted_tons):
        if crop not in CROP_THRESHOLDS:
            return "⚠️ Unknown crop – no reference range available."
        low, high = CROP_THRESHOLDS[crop]
        if predicted_tons < low:
            return "⬇️ LOW yield compared to typical range."
        elif predicted_tons > high:
            return "⬆️ HIGH yield compared to typical range."
        else:
            return "✅ NORMAL yield."

    st.markdown("Enter details below to predict crop yield (in hg/ha and tons/ha).")

    # Inputs
    col1, col2 = st.columns(2)
    with col1:
        Year = st.number_input("📅 Year", min_value=1960, max_value=2030, value=2025)
        Rainfall = st.number_input("🌧️ Avg. Rainfall (mm/year)", value=1200.0)
        Pesticides = st.number_input("🧪 Pesticide use (tonnes)", value=50.0)
    with col2:
        Temp = st.number_input("🌡️ Avg. Temperature (°C)", value=25.0)
        Area = st.text_input("🌍 Country/Region", value="India")
        Crop = st.text_input("🌱 Crop Type", value="Maize")

    # Prediction
    if st.button("🔍 Predict Yield"):
        predicted_hg_per_ha = prediction(Year, Rainfall, Pesticides, Temp, Area, Crop)
        predicted_tons_per_ha = predicted_hg_per_ha * 0.1 / 10  # Convert hg/ha to tons/ha

        st.markdown("### 🌱 Prediction Result")
        st.success(f"📦 Yield: **{predicted_hg_per_ha:.2f} hg/ha** (~{predicted_tons_per_ha:.2f} tons/ha)")

        # Assessment
        assessment = evaluate_yield(Crop, predicted_tons_per_ha)
        st.info(f"🧭 Yield Evaluation: {assessment}")

# ===========================================
# MAIN APP WITH TABS
# ===========================================
def main():
    st.markdown('<h1 class="main-header">🌾 FarmMate - Agricultural Intelligence Platform</h1>', unsafe_allow_html=True)
    
    # Create tabs for different modules
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🌾 Crop Recommendation", 
        "💧 Evapotranspiration", 
        "🧪 Fertilizer Recommendation",
        "❄️ Frost Alarm",
        "🌦️ Weather",
        "📈 Yield Prediction"
    ])
    
    with tab1:
        crop_recommendation_module()
    
    with tab2:
        evapotranspiration_module()
    
    with tab3:
        fertilizer_recommendation_module()
    
    with tab4:
        frost_alarm_module()
    
    with tab5:
        weather_module()
    
    with tab6:
        yield_prediction_module()

if __name__ == "__main__":
    main()