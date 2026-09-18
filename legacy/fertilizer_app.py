import streamlit as st
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder

# Set page config
st.set_page_config(
    page_title="Fertilizer Recommendation System",
    page_icon="🌱",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #2E8B57;
        text-align: center;
        margin-bottom: 2rem;
    }
    .recommendation-box {
        background-color: #F0FFF0;
        padding: 2rem;
        border-radius: 10px;
        border-left: 5px solid #2E8B57;
        margin: 1rem 0;
    }
    .input-section {
        background-color: #F8F9FA;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Load the model and encoders
@st.cache_resource
def load_model():
    try:
        with open('simple_fertilizer_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
        return model_data
    except FileNotFoundError:
        st.error("Model file 'simple_fertilizer_model.pkl' not found. Please ensure it's in the same directory.")
        return None

def recommend_fertilizer_simple(input_data, model_data):
    """Simple prediction function using the retrained model"""
    model = model_data['model']
    features = model_data['features']
    le_fertilizer = model_data['le_fertilizer']
    le_soil = model_data['le_soil']
    le_crop = model_data['le_crop']
    
    # Create input with basic features only
    input_df = pd.DataFrame([input_data])
    
    # Add essential engineered features
    input_df['N_P_Ratio'] = input_df['Nitrogen'] / (input_df['Phosphorous'] + 1e-10)
    input_df['N_K_Ratio'] = input_df['Nitrogen'] / (input_df['Potassium'] + 1e-10)
    input_df['Soil_encoded'] = le_soil.transform([input_data['Soil']])[0]
    input_df['Crop_encoded'] = le_crop.transform([input_data['Crop']])[0]
    
    # Create feature matrix
    X_input = pd.DataFrame(columns=features)
    for feature in features:
        if feature in input_df.columns:
            X_input[feature] = input_df[feature]
        else:
            X_input[feature] = 0  # Fill missing with 0
    
    X_input = X_input[features]
    
    try:
        fertilizer_code = model.predict(X_input)[0]
        fertilizer_name = le_fertilizer.inverse_transform([fertilizer_code])[0]
        
        return {
            'recommended_fertilizer': fertilizer_name,
            'confidence': 0.95,
            'input_parameters': input_data
        }
        
    except Exception as e:
        return {'error': str(e), 'recommended_fertilizer': 'DAP (fallback)'}

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
        # First get ML prediction
        ml_result = recommend_fertilizer_simple(input_data, model_data)
        if 'error' in ml_result:
            raise Exception(ml_result['error'])
        
        ml_recommendation = ml_result['recommended_fertilizer']
        ml_confidence = ml_result.get('confidence', 0.7)
        
        # Get rule-based recommendation
        rule_recommendation, rule_reason, rule_confidence = rule_based_fertilizer_recommendation(input_data)
        
        # Conditions where rule-based should override ML
        ph = input_data['PH']
        nitrogen = input_data['Nitrogen']
        phosphorous = input_data['Phosphorous']
        potassium = input_data['Potassium']
        moisture = input_data['Moisture']
        
        rule_override_conditions = [
            ph < 5.5 or ph > 7.5,  # Extreme pH
            nitrogen < 20 and phosphorous < 15 and potassium < 15,  # Multiple deficiencies
            moisture < 0.3,  # Very dry
            ml_confidence < 0.6  # Low ML confidence
        ]
        
        if any(rule_override_conditions):
            final_recommendation = rule_recommendation
            source = f"Rule-based: {rule_reason}"
            confidence = rule_confidence
        else:
            final_recommendation = ml_recommendation
            source = "ML model"
            confidence = ml_confidence
        
        # Generate explanation
        explanation = []
        if source.startswith("Rule-based"):
            explanation.append(f"Rule-based override: {rule_reason}")
        else:
            explanation.append("Based on ML model prediction")
        
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
            'recommended_fertilizer': final_recommendation,
            'confidence': confidence,
            'explanation': " | ".join(explanation),
            'source': source,
            'input_parameters': input_data
        }
        
    except Exception as e:
        return {'error': f'Recommendation failed: {str(e)}', 'fallback_recommendation': 'Balanced NPK Fertilizer'}

def main():
    st.markdown('<h1 class="main-header">🌱 Fertilizer Recommendation System</h1>', unsafe_allow_html=True)
    
    # Load model
    model_data = load_model()
    if model_data is None:
        return
    
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

if __name__ == "__main__":
    main()