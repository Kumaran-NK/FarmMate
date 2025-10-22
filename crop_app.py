import streamlit as st
import pandas as pd
import numpy as np
import joblib
import time
from typing import Dict, Union
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Page configuration
st.set_page_config(
    page_title="Smart Crop Recommendation System",
    page_icon="🌾",
    layout="wide"
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
</style>
""", unsafe_allow_html=True)

# Available crops and their mappings
AVAILABLE_CROPS = [
    'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 
    'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'coffee',
    'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
    'mungbean', 'blackgram', 'lentil', 'cotton', 'jute', 'rice'
]

# Crop dictionary (as in your original code)
CROP_DICT = {
    'rice': 0, 'maize': 1, 'jute': 2, 'cotton': 3, 'coconut': 4,
    'papaya': 5, 'orange': 6, 'apple': 7, 'muskmelon': 8, 'watermelon': 9,
    'grapes': 10, 'mango': 11, 'banana': 12, 'pomegranate': 13, 'lentil': 14,
    'blackgram': 15, 'mungbean': 16, 'mothbeans': 17, 'pigeonpeas': 18,
    'kidneybeans': 19, 'chickpea': 20, 'coffee': 21
}

# Mock encoder class (replace with your actual model loading in production)
class MockEncoder:
    def __init__(self, classes):
        self.classes_ = classes
    def transform(self, values):
        return [self.classes_.index(v) for v in values]

def load_models():
    """Load the trained models and encoders"""
    try:
        # In production, replace these with actual model loading
        best_model = joblib.load('best_crop_model.pkl')
        scaler = joblib.load('crop_scaler.pkl')
        soil_encoder = joblib.load('soil_type_encoder.pkl')
        growth_encoder = joblib.load('growth_stage_encoder.pkl')
        water_encoder = joblib.load('water_source_type_encoder.pkl')
        
        # Mock encoders for demo
        soil_encoder = MockEncoder(['clayey', 'loamy', 'sandy'])
        growth_encoder = MockEncoder(['flowering', 'seedling', 'vegetative'])
        water_encoder = MockEncoder(['groundwater', 'rainwater', 'river'])
        
        return None, None, soil_encoder, growth_encoder, water_encoder
    except Exception as e:
        st.error(f"Error loading models: {str(e)}")
        return None, None, None, None, None

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

# Main App
def main():
    st.markdown('<h1 class="main-header">🌾 Smart Crop Recommendation System</h1>', unsafe_allow_html=True)
    st.markdown("*Powered by Machine Learning and AI Validation*")
    
    # Load models
    best_model, scaler, soil_encoder, growth_encoder, water_encoder = load_models()
    
    # Sidebar for input
    with st.sidebar:
        st.header("🌱 Enter Farm Details")
        
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
        1. **Enter your farm details** in the sidebar
        2. **Get ML-powered recommendations** with confidence scores
        3. **Receive AI validation** and expert insights
        4. **View detailed analysis** of your farm conditions
        
        **Get started by filling out the form in the sidebar!** 👈
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

if __name__ == "__main__":
    main()