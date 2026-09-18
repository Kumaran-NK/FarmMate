"""
FarmMate - Agricultural Intelligence Platform
Main Production Streamlit Application Entrypoint
"""
import sys
from pathlib import Path

# Add src to python path for modular imports
src_path = Path(__file__).resolve().parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Import services from farmmate package
from farmmate.services.crop_service import crop_service
from farmmate.services.et_service import et_service
from farmmate.services.fertilizer_service import fertilizer_service
from farmmate.services.frost_service import frost_service
from farmmate.services.weather_service import weather_service
from farmmate.services.yield_service import yield_service
from farmmate.services.price_service import price_service

# Page Configuration
st.set_page_config(
    page_title="FarmMate — Agricultural Intelligence Platform",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (CSS) with Glassmorphism & Theme Adaptability
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .main-title {
        font-size: 2.8rem;
        font-weight: 800;
        text-align: center;
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
        letter-spacing: -0.5px;
    }
    
    .sub-title {
        text-align: center;
        color: #64748b;
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 2rem;
    }

    /* Modern Theme-Adaptive Cards */
    .glass-card {
        background: rgba(16, 185, 129, 0.04);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.25rem;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .glass-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.12);
    }

    .glass-header {
        font-size: 1.4rem;
        font-weight: 700;
        color: #059669;
        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    /* Source Badges */
    .badge-ml {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 0.82rem;
        font-weight: 700;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        display: inline-block;
        margin-bottom: 0.75rem;
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
    }
    
    .badge-fallback {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        font-size: 0.82rem;
        font-weight: 700;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        display: inline-block;
        margin-bottom: 0.75rem;
    }

    /* Metric Boxes */
    .metric-card-custom {
        background: rgba(16, 185, 129, 0.08);
        border-left: 4px solid #10b981;
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
    }
    
    .metric-card-custom .val {
        font-size: 1.8rem;
        font-weight: 800;
        color: #047857;
    }
    
    .metric-card-custom .lbl {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Risk Alerts */
    .risk-high {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-left: 6px solid #ef4444;
        border-radius: 12px;
        padding: 1.25rem;
        color: #dc2626;
    }
    
    .risk-moderate {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-left: 6px solid #f59e0b;
        border-radius: 12px;
        padding: 1.25rem;
        color: #d97706;
    }
    
    .risk-low {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-left: 6px solid #10b981;
        border-radius: 12px;
        padding: 1.25rem;
        color: #059669;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-title">🌾 FarmMate Intelligence Platform</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Full-Stack Data-Driven Machine Learning & Agronomic Decision Support</div>', unsafe_allow_html=True)

# Navigation Tabs
tab_crop, tab_et, tab_fert, tab_frost, tab_weather, tab_yield, tab_price = st.tabs([
    "🌾 Crop Recommendation",
    "💧 ET Calculator",
    "🧪 Fertilizer Guide",
    "❄️ Frost Risk Alarm",
    "🌤️ Weather & Rain AI",
    "🚜 Yield Predictor",
    "📈 Market Price Advisor"
])

# ==============================================================================
# TAB 1: CROP RECOMMENDATION
# ==============================================================================
with tab_crop:
    st.header("🌾 Smart Crop Recommendation Engine")
    st.markdown("Predict the optimal crop to cultivate based on exact soil chemical properties and micro-climate parameters using a **Trained Random Forest Classifier**.")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.subheader("🧪 Soil Nutrients (ppm)")
        n_input = st.number_input("Nitrogen (N)", min_value=0, max_value=200, value=90, key="crop_n")
        p_input = st.number_input("Phosphorus (P)", min_value=0, max_value=200, value=42, key="crop_p")
        k_input = st.number_input("Potassium (K)", min_value=0, max_value=250, value=43, key="crop_k")
        ph_input = st.slider("Soil pH Level", min_value=3.5, max_value=9.5, value=6.5, step=0.1, key="crop_ph")

    with col2:
        st.subheader("🌤️ Micro-Climate")
        temp_input = st.slider("Temperature (°C)", min_value=5.0, max_value=50.0, value=20.8, step=0.5, key="crop_temp")
        hum_input = st.slider("Relative Humidity (%)", min_value=10.0, max_value=100.0, value=82.0, step=1.0, key="crop_hum")
        rain_input = st.number_input("Annual Rainfall (mm)", min_value=10.0, max_value=3500.0, value=202.9, step=10.0, key="crop_rain")

    with col3:
        st.subheader("⚙️ Model Execution")
        st.info("Features are dynamically transformed into a 32-feature vector for RandomForest ML inference.")
        
        with st.expander("🛠️ Advanced Agronomic Parameters"):
            soil_moisture = st.slider("Soil Moisture (%)", 10.0, 90.0, 40.0, key="crop_moist")
            soil_type = st.selectbox("Soil Type", ['loamy', 'clayey', 'sandy'], key="crop_stype")
            growth_stage = st.selectbox("Growth Stage", ['vegetative', 'flowering', 'seedling'], key="crop_gstage")
            water_src = st.selectbox("Water Source", ['groundwater', 'rainwater', 'river'], key="crop_wsrc")
            sunlight = st.slider("Sunlight Exposure (hrs/day)", 3.0, 12.0, 8.0, key="crop_sun")
            wind_speed = st.slider("Wind Speed (km/h)", 1.0, 30.0, 5.0, key="crop_wind")
            
        predict_crop_btn = st.button("🔍 Recommend Crop", type="primary", use_container_width=True, key="crop_btn")

    if predict_crop_btn:
        features = {
            'N': n_input, 'P': p_input, 'K': k_input,
            'temperature': temp_input, 'humidity': hum_input,
            'ph': ph_input, 'rainfall': rain_input,
            'soil_moisture': soil_moisture, 'soil_type': soil_type,
            'growth_stage': growth_stage, 'water_source_type': water_src,
            'sunlight_exposure': sunlight, 'wind_speed': wind_speed
        }
        
        with st.spinner("Executing Random Forest Crop Classification..."):
            result = crop_service.recommend_crop(features)

        st.markdown("---")
        badge_class = "badge-ml" if "Model" in result.get('source', '') else "badge-fallback"
        badge_label = "🤖 " + result.get('source', 'ML Model')
        
        res_col1, res_col2 = st.columns([1.2, 1])
        
        with res_col1:
            st.markdown(f'<span class="{badge_class}">{badge_label}</span>', unsafe_allow_html=True)
            st.markdown(f"""
            <div class="glass-card">
                <h3 class="glass-header">🌟 Recommended Crop: {result['predicted_crop']}</h3>
                <h4 style="margin:0; color:#10b981;">Model Confidence: {result['probability']:.1%}</h4>
            </div>
            """, unsafe_allow_html=True)
            
            top5_df = pd.DataFrame(result['top5_recommendations'], columns=['Crop', 'Probability'])
            top5_df['Probability (%)'] = top5_df['Probability'] * 100
            fig = px.bar(
                top5_df, x='Probability (%)', y='Crop', orientation='h',
                title="Top 5 Candidate Crops", color='Probability (%)',
                color_continuous_scale='Viridis'
            )
            fig.update_layout(yaxis={'categoryorder':'total ascending'}, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)

        with res_col2:
            st.subheader("📊 Farm Parameters Radar")
            categories = ['N', 'P', 'K', 'Temp', 'Humidity', 'pH', 'Rainfall']
            norm_values = [
                n_input / 140.0, p_input / 145.0, k_input / 205.0,
                temp_input / 45.0, hum_input / 100.0, ph_input / 10.0, min(rain_input / 300.0, 1.0)
            ]
            fig_radar = go.Figure(data=go.Scatterpolar(
                r=norm_values, theta=categories, fill='toself', name='Farm Parameters', line_color='#10b981'
            ))
            fig_radar.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)'
            )
            st.plotly_chart(fig_radar, use_container_width=True)


# ==============================================================================
# TAB 2: EVAPOTRANSPIRATION (ET) CALCULATOR
# ==============================================================================
with tab_et:
    st.header("💧 Evapotranspiration (ET0) & Irrigation Planning")
    st.markdown("Calculate reference Evapotranspiration using the **FAO-56 Penman-Monteith** formulation to determine optimal daily crop water requirements.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("📍 Location Parameters")
        lat_et = st.number_input("Latitude", value=13.0827, format="%.4f", key="et_lat")
        lon_et = st.number_input("Longitude", value=80.2707, format="%.4f", key="et_lon")

    with col2:
        st.subheader("🌾 Target Crop Selection")
        selected_crop_et = st.selectbox(
            "Target Crop",
            options=list(et_service.CROP_COEFFICIENTS.keys()),
            index=0, key="et_crop"
        )
        calc_et_btn = st.button("🧮 Calculate ET0 & Water Need", type="primary", use_container_width=True, key="et_btn")

    if calc_et_btn or selected_crop_et:
        with st.spinner("Fetching weather data & computing Penman-Monteith ET0..."):
            et_res = et_service.get_et_forecast(lat_et, lon_et, crop_name=selected_crop_et)

        if "error" in et_res:
            st.error(et_res["error"])
        else:
            st.markdown("---")
            st.subheader(f"💧 Daily Water Requirements for {selected_crop_et.title()} (Kc = {et_res['crop_coefficient']})")
            
            df_et = pd.DataFrame(et_res["forecast"])
            avg_et0 = df_et["et0_mm_day"].mean() if not df_et.empty else 3.5
            avg_water = df_et["crop_water_need_mm_day"].mean() if not df_et.empty else 3.8
            
            m1, m2, m3 = st.columns(3)
            with m1:
                st.markdown(f'<div class="metric-card-custom"><div class="val">{avg_et0:.2f} mm</div><div class="lbl">Avg Daily ET0</div></div>', unsafe_allow_html=True)
            with m2:
                st.markdown(f'<div class="metric-card-custom"><div class="val">{avg_water:.2f} mm</div><div class="lbl">Avg Crop Water Need</div></div>', unsafe_allow_html=True)
            with m3:
                st.markdown(f'<div class="metric-card-custom"><div class="val">{et_res["crop_coefficient"]}</div><div class="lbl">Crop Kc Factor</div></div>', unsafe_allow_html=True)

            st.markdown("<br>", unsafe_allow_html=True)
            fig_et = px.line(
                df_et, x='date', y=['et0_mm_day', 'crop_water_need_mm_day'],
                labels={'value': 'Water (mm/day)', 'variable': 'Parameter'},
                title="5-Day Forecast: Reference ET0 vs Crop Water Need",
                markers=True, color_discrete_sequence=['#0288d1', '#10b981']
            )
            fig_et.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_et, use_container_width=True)


# ==============================================================================
# TAB 3: FERTILIZER RECOMMENDATION
# ==============================================================================
with tab_fert:
    st.header("🧪 Fertilizer Advisory System")
    st.markdown("Identify soil nutrient deficiencies and receive exact fertilizer dosage recommendations via **Trained ML Models**.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("🌱 Soil & Crop Inputs")
        fert_crop = st.selectbox("Crop Type", [
            'Wheat', 'Rice', 'Maize', 'Barley', 'Millet', 'Sugarcane',
            'Cotton', 'Tea', 'Coffee', 'Apple', 'Banana', 'Mango'
        ], key="fert_crop")
        fert_soil = st.selectbox("Soil Type", ['Loamy', 'Sandy', 'Neutral Soil', 'Clay', 'Acidic Soil', 'Alkaline Soil'], key="fert_soil")
        fert_temp = st.slider("Temperature (°C)", 10.0, 45.0, 26.0, key="fert_temp")
        fert_hum = st.slider("Humidity (%)", 10.0, 100.0, 52.0, key="fert_hum")

    with col2:
        st.subheader("🧪 Soil Moisture & Nutrients")
        fert_moist = st.slider("Soil Moisture (%)", 10.0, 90.0, 38.0, key="fert_moist")
        fert_n = st.number_input("Nitrogen (N)", 0, 140, 37, key="fert_n")
        fert_p = st.number_input("Phosphorous (P)", 0, 140, 20, key="fert_p")
        fert_k = st.number_input("Potassium (K)", 0, 140, 20, key="fert_k")
        predict_fert_btn = st.button("🧪 Recommend Fertilizer", type="primary", use_container_width=True, key="fert_btn")

    if predict_fert_btn or fert_crop:
        with st.spinner("Processing fertilizer prediction model..."):
            fert_res = fertilizer_service.recommend_fertilizer(
                temperature=fert_temp, humidity=fert_hum, moisture=fert_moist,
                soil_type=fert_soil, crop_type=fert_crop,
                nitrogen=fert_n, potassium=fert_k, phosphorous=fert_p
            )

        st.markdown("---")
        badge_class = "badge-ml" if "Classifier" in fert_res.get('source', '') else "badge-fallback"
        badge_label = "🤖 " + fert_res.get('source', 'ML Model')
        
        st.markdown(f'<span class="{badge_class}">{badge_label}</span>', unsafe_allow_html=True)
        st.markdown(f"""
        <div class="glass-card">
            <h3 class="glass-header">🌿 Recommended Fertilizer: {fert_res['recommended_fertilizer']}</h3>
            <p style="margin:0;"><b>Diagnosis & Advice:</b> {fert_res['advice']}</p>
        </div>
        """, unsafe_allow_html=True)


# ==============================================================================
# TAB 4: FROST RISK ALARM
# ==============================================================================
with tab_frost:
    st.header("❄️ Indian Agricultural Frost Risk Alarm")
    st.markdown("Predict localized frost hazards for cold-sensitive Indian agricultural regions using **Trained XGBoost Classifier**.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("📍 Select Region / City")
        frost_city = st.selectbox("City", list(frost_service.CITIES_DATA.keys()), index=1, key="frost_city")
        st.subheader("🌡️ Ambient Telemetry")
        frost_temp = st.slider("Ambient Temperature (°C)", -5.0, 30.0, 2.0, step=0.5, key="f_temp")
        frost_hum = st.slider("Humidity (%)", 10.0, 100.0, 85.0, step=1.0, key="f_hum")

    with col2:
        st.subheader("☁️ Environmental Conditions")
        frost_wind = st.slider("Wind Speed (m/s)", 0.0, 20.0, 1.5, step=0.5, key="f_wind")
        frost_cloud = st.slider("Cloud Cover (%)", 0.0, 100.0, 10.0, step=5.0, key="f_cloud")
        predict_frost_btn = st.button("❄️ Evaluate Frost Risk", type="primary", use_container_width=True, key="f_btn")

    if predict_frost_btn or frost_city:
        f_features = {
            'city': frost_city,
            'temperature': frost_temp,
            'humidity': frost_hum,
            'wind_speed': frost_wind,
            'cloud_cover': frost_cloud
        }
        with st.spinner("Executing XGBoost Frost Classification Model..."):
            frost_res = frost_service.predict_frost_risk(f_features)

        risk_level = frost_res["risk_level"]
        risk_class = "risk-high" if "HIGH" in risk_level else ("risk-moderate" if "MODERATE" in risk_level else "risk-low")
        
        st.markdown("---")
        st.markdown(f'<span class="badge-ml">🤖 Trained XGBoost Model</span>', unsafe_allow_html=True)
        st.markdown(f"""
        <div class="{risk_class}">
            <h3 style="margin-top:0;">{risk_level} (Probability: {frost_res['probability']:.1%})</h3>
            <p style="margin:0;"><b>Advisory:</b> {frost_res['advisory']}</p>
        </div>
        """, unsafe_allow_html=True)


# ==============================================================================
# TAB 5: WEATHER FORECAST & RAIN AI
# ==============================================================================
with tab_weather:
    st.header("🌤️ Weather Forecast & Rain Probability AI")
    st.markdown("Integrates OpenWeatherMap live telemetry with **XGBoost Rain Classifier**.")

    col1, col2 = st.columns([2, 1])
    with col1:
        weather_city = st.text_input("Enter City Name", value="New Delhi", key="w_city")
    with col2:
        predict_w_btn = st.button("🌤️ Get Weather Forecast", type="primary", use_container_width=True, key="w_btn")

    if predict_w_btn or weather_city:
        with st.spinner("Querying weather API & running AI forecast models..."):
            w_res = weather_service.predict_weather(city_name=weather_city)

        curr = w_res["current_weather"]
        rain = w_res["rain_prediction"]
        hourly = w_res["hourly_forecast"]

        st.markdown("---")
        st.subheader(f"📍 Weather Report for {curr['city']}, {curr.get('country', '')}")
        
        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{curr["temp"]} °C</div><div class="lbl">Temperature</div></div>', unsafe_allow_html=True)
        with m2:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{curr["humidity"]} %</div><div class="lbl">Humidity</div></div>', unsafe_allow_html=True)
        with m3:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{curr["wind_speed"]} m/s</div><div class="lbl">Wind Speed</div></div>', unsafe_allow_html=True)
        with m4:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{rain["probability"]:.0%}</div><div class="lbl">Rain AI Prob</div></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.info(f"<b>Rain Advisory:</b> {rain['advice']}", icon="🌧️")

        st.subheader("📈 5-Hour Weather Outlook")
        df_hourly = pd.DataFrame({
            'Time': hourly['times'],
            'Temperature (°C)': hourly['temperatures'],
            'Humidity (%)': hourly['humidities']
        })
        fig_w = px.line(
            df_hourly, x='Time', y=['Temperature (°C)', 'Humidity (%)'],
            title="Short-Term Hourly Weather Outlook", markers=True
        )
        fig_w.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_w, use_container_width=True)


# ==============================================================================
# TAB 6: CROP YIELD PREDICTOR
# ==============================================================================
with tab_yield:
    st.header("🚜 Agricultural Yield Predictor")
    st.markdown("Estimate harvest yields (in hg/ha and total Tonnes) using **DecisionTree Regressor**.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("🌾 Crop & Area")
        y_crop = st.selectbox("Crop Type", yield_service.SUPPORTED_CROPS, key="y_crop")
        y_area = st.number_input("Cultivation Area (Hectares)", min_value=0.1, max_value=10000.0, value=5.0, step=0.5, key="y_area")
        y_temp = st.slider("Average Temperature (°C)", 5.0, 45.0, 24.0, step=0.5, key="y_temp")

    with col2:
        st.subheader("🌧️ Climate & Pest Inputs")
        y_rain = st.number_input("Annual Rainfall (mm)", min_value=50.0, max_value=4000.0, value=1200.0, step=50.0, key="y_rain")
        y_pest = st.number_input("Pesticide Usage (Tonnes)", min_value=0.0, max_value=500.0, value=10.0, step=0.5, key="y_pest")
        predict_y_btn = st.button("🚜 Estimate Yield", type="primary", use_container_width=True, key="y_btn")

    if predict_y_btn or y_crop:
        with st.spinner("Executing Decision Tree Yield Prediction Model..."):
            y_res = yield_service.predict_yield(
                crop=y_crop, area_ha=y_area, annual_rainfall=y_rain,
                pesticides_tonnes=y_pest, avg_temp=y_temp
            )

        st.markdown("---")
        st.markdown(f'<span class="badge-ml">🤖 Trained DecisionTree ML Model</span>', unsafe_allow_html=True)
        m1, m2, m3 = st.columns(3)
        with m1:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{y_res["predicted_yield_hg_ha"]:,.0f}</div><div class="lbl">Yield (hg/ha)</div></div>', unsafe_allow_html=True)
        with m2:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{y_res["yield_tonnes_per_ha"]:.2f}</div><div class="lbl">Tonnes / Hectare</div></div>', unsafe_allow_html=True)
        with m3:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{y_res["total_production_tonnes"]:.2f} T</div><div class="lbl">Total Harvest</div></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.success(f"✅ Harvest forecast for **{y_area} Hectares** of **{y_crop}**: **{y_res['total_production_tonnes']:.2f} Tonnes** ({y_res['yield_evaluation']})")


# ==============================================================================
# TAB 7: VEGETABLE MARKET PRICE ADVISOR
# ==============================================================================
with tab_price:
    st.header("📈 Vegetable Market Price & Demand Forecaster")
    st.markdown("Forecast wholesale market prices (INR per Quintal) using **Stacking Ensemble Regressor (XGBoost + LightGBM + CatBoost)**.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("🥦 Commodity & Geography")
        p_item = st.selectbox("Vegetable Commodity", price_service.ITEMS, key="p_item")
        p_state = st.selectbox("State", price_service.STATES, key="p_state")
        p_market = st.selectbox("Market / Mandi", price_service.MARKETS, key="p_market")

    with col2:
        st.subheader("📅 Seasonality")
        p_month = st.select_slider("Month", options=[
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ], value='October', key="p_month")
        p_temp = st.slider("Temperature (°C)", 10.0, 45.0, 25.0, key="p_temp")
        predict_p_btn = st.button("📈 Forecast Market Price", type="primary", use_container_width=True, key="p_btn")

    if predict_p_btn or p_item:
        with st.spinner("Evaluating Stacked Price Forecasting Model..."):
            p_res = price_service.predict_price(
                vegetable=p_item, state=p_state, market=p_market,
                month=p_month, temp=p_temp
            )

        st.markdown("---")
        badge_class = "badge-ml" if "Stacking" in p_res.get('source', '') else "badge-fallback"
        badge_label = "🤖 " + p_res.get('source', 'ML Model')
        st.markdown(f'<span class="{badge_class}">{badge_label}</span>', unsafe_allow_html=True)
        
        m1, m2, m3 = st.columns(3)
        with m1:
            st.markdown(f'<div class="metric-card-custom"><div class="val">₹ {p_res["predicted_price_rs_per_quintal"]:.2f}</div><div class="lbl">Price per Quintal</div></div>', unsafe_allow_html=True)
        with m2:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{p_res["demand_status"]}</div><div class="lbl">Demand Status</div></div>', unsafe_allow_html=True)
        with m3:
            st.markdown(f'<div class="metric-card-custom"><div class="val">{p_res["price_trend"]}</div><div class="lbl">Price Trend</div></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown(f"""
        <div class="glass-card">
            <h3 class="glass-header">💡 Selling Advisory for {p_item} in {p_market} ({p_state})</h3>
            <p style="margin:0;">{p_res['advisory']}</p>
        </div>
        """, unsafe_allow_html=True)


# Footer
st.markdown("---")
st.markdown("<p style='text-align: center; color: #64748b; font-weight: 500;'>FarmMate Agricultural Intelligence Platform &copy; 2026. Powered by Machine Learning.</p>", unsafe_allow_html=True)
