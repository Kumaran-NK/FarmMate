import streamlit as st
import pandas as pd
import numpy as np
import joblib

# Load model and preprocessor (make sure these are saved beforehand)
dtr = joblib.load("dtr_model.pkl")
preprocesser = joblib.load("yield_preprocessor.pkl")

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

# ----------------------------
# Streamlit UI
# ----------------------------
st.set_page_config(page_title="🌾 Crop Yield Predictor", layout="centered")
st.title("🌾 Crop Yield Prediction App")

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
