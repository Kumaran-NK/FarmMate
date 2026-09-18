# vegetable_price_app.py
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import streamlit as st
from pathlib import Path
from typing import Tuple, Dict, Any, List

from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.ensemble import StackingRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor

# Set page config
st.set_page_config(
    page_title="Vegetable Price Predictor",
    page_icon="🥦",
    layout="wide",
    initial_sidebar_state="expanded"
)

SEED = 42
N_JOBS = -1
DEFAULT_SAVE = "vegetable_price_stack.pkl"

MONTH_MAP = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'sept': 9, 'september': 9,
    'oct': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12
}

# -------------------------
# Cleaning / Preprocessing
# -------------------------
def clean_and_prepare_df(df: pd.DataFrame, training: bool = True) -> pd.DataFrame:
    """Clean DataFrame."""
    df = df.copy()
    df.columns = [c.strip() for c in df.columns]

    for c in df.select_dtypes(include=['object']).columns:
        df[c] = df[c].astype(str).str.strip().replace({'': np.nan, 'nan': np.nan, 'None': np.nan, 'NA': np.nan})

    if 'Vegetable condition' in df.columns:
        df['Vegetable condition'] = df['Vegetable condition'].str.replace('scarp', 'scrap', regex=False)

    if 'Deasaster Happen in last 3month' in df.columns:
        df['Deasaster Happen in last 3month'] = (
            df['Deasaster Happen in last 3month'].astype(str).str.lower()
        )

    if 'Month' in df.columns:
        df['Month'] = df['Month'].astype(str).str.strip().str.lower()

    if training:
        if 'Price per kg' not in df.columns:
            raise ValueError("Dataset must contain 'Price per kg' column in training mode")
        df['Price per kg'] = pd.to_numeric(df['Price per kg'], errors='coerce')

    if 'Temp' in df.columns:
        df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].isna().any():
            if training:
                df[col] = df[col].fillna(df[col].mean())
            else:
                df[col] = df[col].fillna(0)

    return df

def preprocess_inputs(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, StandardScaler, List[str], List[str]]:
    """Full preprocessing pipeline for training."""
    df = clean_and_prepare_df(df, training=True)

    if 'Deasaster Happen in last 3month' in df.columns:
        df['Deasaster Happen in last 3month'] = df['Deasaster Happen in last 3month'].replace({'no': 0, 'yes': 1, 'n': 0, 'y': 1})
        df['Deasaster Happen in last 3month'] = df['Deasaster Happen in last 3month'].fillna(0).astype(int)

    if 'Month' in df.columns:
        df['Month'] = df['Month'].map(MONTH_MAP)
        if df['Month'].isna().any():
            df['Month'] = df['Month'].fillna(df['Month'].mode()[0] if not df['Month'].mode().empty else 1)

    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].mean())

    categorical_cols = [c for c in ['Vegetable', 'Season', 'Vegetable condition'] if c in df.columns]
    if categorical_cols:
        df_enc = pd.get_dummies(df, columns=categorical_cols, drop_first=False)
    else:
        df_enc = df.copy()

    y = df_enc['Price per kg']
    X = df_enc.drop('Price per kg', axis=1)

    X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.7, random_state=SEED, shuffle=True)

    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()

    scaler = StandardScaler()
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    if numeric_cols:
        X_train_scaled[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])
        X_test_scaled[numeric_cols] = scaler.transform(X_test[numeric_cols])

    feature_columns = list(X.columns)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_columns, numeric_cols

# -------------------------
# Model builders / trainers
# -------------------------
def build_stacked_model(do_tune: bool = False, random_state: int = SEED, n_jobs: int = N_JOBS):
    xgb = XGBRegressor(n_estimators=200, learning_rate=0.08, max_depth=4, random_state=random_state, n_jobs=n_jobs, verbosity=0)
    lgbm = LGBMRegressor(n_estimators=200, learning_rate=0.08, max_depth=6, random_state=random_state, n_jobs=n_jobs)
    cat = CatBoostRegressor(iterations=200, learning_rate=0.08, depth=4, verbose=0, random_state=random_state)

    if do_tune:
        xgb_param = {'n_estimators': [100, 200], 'learning_rate': [0.05, 0.08], 'max_depth': [3, 4]}
        lgbm_param = {'n_estimators': [100, 200], 'learning_rate': [0.05, 0.08], 'max_depth': [3, 6]}
        cat_param = {'iterations': [100, 200], 'learning_rate': [0.05, 0.08], 'depth': [3, 4]}

        xgb = RandomizedSearchCV(XGBRegressor(random_state=random_state, n_jobs=n_jobs, verbosity=0),
                                 xgb_param, n_iter=3, cv=3, random_state=random_state, n_jobs=1, verbose=0)
        lgbm = RandomizedSearchCV(LGBMRegressor(random_state=random_state, n_jobs=n_jobs),
                                  lgbm_param, n_iter=3, cv=3, random_state=random_state, n_jobs=1, verbose=0)
        cat = RandomizedSearchCV(CatBoostRegressor(random_state=random_state, verbose=0),
                                 cat_param, n_iter=3, cv=3, random_state=random_state, n_jobs=1, verbose=0)

    stack = StackingRegressor(
        estimators=[('xgb', xgb), ('lgbm', lgbm), ('cat', cat)],
        final_estimator=Ridge(alpha=1.0),
        n_jobs=n_jobs,
        passthrough=False
    )
    return stack

def train_and_evaluate(df: pd.DataFrame, do_tune: bool = False, save_path: str = DEFAULT_SAVE) -> Tuple[Dict[str, Any], Tuple[float, float, float]]:
    X_train, X_test, y_train, y_test, scaler, feature_columns, numeric_cols = preprocess_inputs(df)

    model = build_stacked_model(do_tune=do_tune)
    with st.spinner("Training stacked ensemble..."):
        model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    y_test_arr = np.asarray(y_test)
    y_pred_arr = np.asarray(y_pred)

    r2 = r2_score(y_test_arr, y_pred_arr)
    mse = mean_squared_error(y_test_arr, y_pred_arr)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test_arr, y_pred_arr)

    artefacts = {
        'model': model,
        'scaler': scaler,
        'feature_columns': feature_columns,
        'numeric_cols': numeric_cols
    }
    joblib.dump(artefacts, save_path)

    return artefacts, (r2, rmse, mae)

# -------------------------
# Prediction helpers
# -------------------------
def load_pipeline(pickle_path: str = DEFAULT_SAVE):
    artefacts = joblib.load(pickle_path)
    return artefacts['model'], artefacts['scaler'], artefacts['feature_columns'], artefacts.get('numeric_cols', [])

def simulate_demand(price: float, baseline_demand: float = 100, elasticity: float = 0.5) -> float:
    price = float(price)
    return baseline_demand * (price / baseline_demand) ** (-elasticity)

def logistics_advice(season: str, condition: str) -> str:
    season = str(season).strip().lower()
    condition = str(condition).strip().lower()
    if condition in ['scrap', 'scrp', 'scraped', 'damaged']:
        return "Recommend local sale or processing (low transport value)."
    if season in ['summer', 'monsoon', 'rainy']:
        return "Use cold-chain / refrigerated transport and faster routes to retain freshness."
    return "Standard transport with good packaging; prioritize high-demand markets."

def crop_recommendation(predicted_demand: float, threshold_high: float = 100, threshold_low: float = 60) -> str:
    if predicted_demand >= threshold_high:
        return "High demand — consider planting more of this crop next cycle (or increasing harvest)."
    elif predicted_demand <= threshold_low:
        return "Low demand — consider diversifying to other crops or storing."
    return "Moderate demand — maintain current planting levels."

def predict_price(model, scaler, feature_columns: List[str], numeric_cols: List[str], 
                 vegetable: str, season: str, month: str, temp: float, 
                 disaster: str, condition: str, baseline_demand: int = 100):
    
    user_df_original = pd.DataFrame({
        'Vegetable': [vegetable],
        'Season': [season],
        'Month': [month],
        'Temp': [temp],
        'Deasaster Happen in last 3month': [disaster],
        'Vegetable condition': [condition]
    })

    user_df = user_df_original.copy()
    user_df = clean_and_prepare_df(user_df, training=False)

    user_df['Month'] = user_df['Month'].map(MONTH_MAP).fillna(1)
    user_df['Deasaster Happen in last 3month'] = (
        user_df['Deasaster Happen in last 3month']
        .str.lower()
        .replace({'no': 0, 'yes': 1, 'n': 0, 'y': 1})
        .fillna(0)
        .astype(int)
    )
    user_df['Vegetable condition'] = user_df['Vegetable condition'].fillna('fresh')
    user_df['Temp'] = pd.to_numeric(user_df['Temp'], errors='coerce').fillna(0)

    cat_cols = [c for c in ['Vegetable', 'Season', 'Vegetable condition'] if c in user_df.columns]
    
    user_enc = pd.get_dummies(user_df, columns=cat_cols, drop_first=False)
    
    for col in feature_columns:
        if col not in user_enc.columns:
            user_enc[col] = 0
    
    user_enc = user_enc[feature_columns]

    if numeric_cols:
        user_enc[numeric_cols] = scaler.transform(user_enc[numeric_cols])

    pred_price = float(model.predict(user_enc)[0])
    pred_demand = simulate_demand(pred_price, baseline_demand=baseline_demand)
    logistics = logistics_advice(season, condition)
    recommendation = crop_recommendation(pred_demand)
    
    return {
        'price': pred_price, 
        'demand': pred_demand, 
        'logistics': logistics, 
        'recommendation': recommendation,
        'input_data': user_df_original
    }

# -------------------------
# Visualization
# -------------------------
def plot_monthly_trends(df: pd.DataFrame):
    df = df.copy()
    df['Month_norm'] = df['Month'].astype(str).str.strip().str.lower().map(MONTH_MAP)
    if df['Month_norm'].isna().all():
        return None
    monthly = df.groupby('Month_norm')['Price per kg'].mean().sort_index()
    
    fig, ax = plt.subplots(figsize=(8, 4))
    monthly.plot(marker='o', ax=ax)
    ax.set_title('Average Price per kg by Month (aggregated)')
    ax.set_xlabel('Month (1=Jan)')
    ax.set_ylabel('Avg Price per kg')
    ax.grid(True)
    
    return fig

# -------------------------
# Streamlit App
# -------------------------
def main():
    st.title("🥦 Vegetable Price Prediction System")
    st.markdown("Predict vegetable prices and get farming recommendations based on market conditions")
    
    # Sidebar
    st.sidebar.header("Configuration")
    baseline_demand = st.sidebar.slider("Baseline Demand", 50, 200, 100)
    do_tune = st.sidebar.checkbox("Enable Hyperparameter Tuning", value=False)
    
    # File upload
    uploaded_file = st.sidebar.file_uploader("Upload CSV dataset", type=["csv"])
    
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        st.sidebar.success(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
        
        # Train model
        if st.sidebar.button("Train Model"):
            with st.spinner("Training model..."):
                artefacts, metrics = train_and_evaluate(df, do_tune=do_tune, save_path=DEFAULT_SAVE)
                st.sidebar.success("Model trained successfully!")
                
                r2, rmse, mae = metrics
                st.sidebar.metric("R² Score", f"{r2:.4f}")
                st.sidebar.metric("RMSE", f"{rmse:.4f}")
                st.sidebar.metric("MAE", f"{mae:.4f}")
    
    # Load model if available
    try:
        model, scaler, feature_columns, numeric_cols = load_pipeline(DEFAULT_SAVE)
        model_loaded = True
    except:
        model_loaded = False
        st.warning("No trained model found. Please upload a dataset and train the model first.")
    
    # Main content
    tab1, tab2, tab3 = st.tabs(["Price Prediction", "Data Analysis", "About"])
    
    with tab1:
        st.header("Price Prediction")
        
        if model_loaded:
            col1, col2 = st.columns(2)
            
            with col1:
                vegetable = st.selectbox("Vegetable", ["Tomato", "Potato", "Onion", "Carrot", "Cabbage", "Spinach"])
                season = st.selectbox("Season", ["Winter", "Summer", "Monsoon", "Spring"])
                month = st.selectbox("Month", list(MONTH_MAP.keys()))
                
            with col2:
                temp = st.slider("Temperature (°C)", -10, 50, 25)
                disaster = st.radio("Disaster in last 3 months", ["No", "Yes"])
                condition = st.selectbox("Vegetable Condition", ["Fresh", "Scrap"])
            
            if st.button("Predict Price", type="primary"):
                result = predict_price(
                    model, scaler, feature_columns, numeric_cols,
                    vegetable, season, month, temp, 
                    disaster.lower(), condition.lower(), baseline_demand
                )
                
                st.success("Prediction Complete!")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Input Summary")
                    st.dataframe(result['input_data'], use_container_width=True)
                    
                    st.metric("Predicted Price per kg", f"₹{result['price']:.2f}")
                    st.metric("Estimated Demand", f"{result['demand']:.2f} units")
                
                with col2:
                    st.subheader("Recommendations")
                    
                    st.info("📦 Logistics Advice")
                    st.write(result['logistics'])
                    
                    st.info("🌱 Crop Recommendation")
                    st.write(result['recommendation'])
        else:
            st.info("Train a model first to enable predictions")
    
    with tab2:
        st.header("Data Analysis")
        
        if uploaded_file is not None:
            st.subheader("Dataset Overview")
            st.dataframe(df.head())
            
            st.subheader("Basic Statistics")
            st.write(df.describe())
            
            if 'Price per kg' in df.columns and 'Month' in df.columns:
                st.subheader("Monthly Price Trends")
                fig = plot_monthly_trends(df)
                if fig:
                    st.pyplot(fig)
                else:
                    st.warning("Could not generate monthly trends plot")
            else:
                st.warning("Required columns ('Price per kg', 'Month') not found for trend analysis")
        else:
            st.info("Upload a dataset to enable data analysis")
    
    with tab3:
        st.header("About")
        st.markdown("""
        ### Vegetable Price Prediction System
        
        This application uses machine learning to predict vegetable prices based on:
        - Vegetable type
        - Season and month
        - Temperature
        - Disaster occurrences
        - Vegetable condition
        
        ### Features:
        - **Price Prediction**: Predict vegetable prices per kg
        - **Demand Estimation**: Simulate market demand based on price elasticity
        - **Logistics Advice**: Get transportation recommendations
        - **Crop Planning**: Receive farming recommendations
        
        ### Technical Details:
        - Uses Stacking Ensemble (XGBoost, LightGBM, CatBoost)
        - StandardScaler for feature normalization
        - RandomizedSearchCV for hyperparameter tuning
        
        Upload your dataset, train the model, and start predicting!
        """)

if __name__ == "__main__":
    main()