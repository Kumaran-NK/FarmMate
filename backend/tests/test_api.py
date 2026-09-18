"""
FastAPI Backend Endpoint Integration & Unit Tests
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_crop_recommendation_endpoint():
    payload = {
        "N": 90, "P": 42, "K": 43,
        "temperature": 20.8, "humidity": 82.0, "ph": 6.5, "rainfall": 202.9
    }
    response = client.post("/api/crop/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "predicted_crop" in data["data"]
    assert "probability" in data["data"]

def test_fertilizer_recommendation_endpoint():
    payload = {
        "temperature": 26.0, "humidity": 52.0, "moisture": 38.0,
        "soil_type": "Loamy Soil", "crop_type": "Wheat",
        "nitrogen": 37.0, "potassium": 20.0, "phosphorous": 20.0
    }
    response = client.post("/api/fertilizer/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "recommended_fertilizer" in data["data"]

def test_yield_predict_endpoint():
    payload = {
        "crop": "Maize", "area_ha": 5.0, "annual_rainfall": 1200.0,
        "pesticides_tonnes": 10.0, "avg_temp": 25.0
    }
    response = client.post("/api/yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "total_production_tonnes" in data["data"]

def test_market_predict_endpoint():
    payload = {
        "vegetable": "Tomato", "state": "Tamil Nadu", "market": "Chennai",
        "month": "October", "temp": 25.0
    }
    response = client.post("/api/market/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "predicted_price_rs_per_quintal" in data["data"]

def test_weather_predict_endpoint():
    payload = {"city_name": "Chennai"}
    response = client.post("/api/weather/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "current_weather" in data["data"]

def test_frost_predict_endpoint():
    payload = {
        "city": "Shimla", "temperature": 2.0, "humidity": 85.0,
        "wind_speed": 1.5, "cloud_cover": 10.0
    }
    response = client.post("/api/frost/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "risk_level" in data["data"]

def test_et0_calculate_endpoint():
    payload = {"lat": 13.0827, "lon": 80.2707, "crop_name": "tomatoes"}
    response = client.post("/api/et0/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "forecast" in data["data"]

def test_crop_catalog_endpoint():
    response = client.get("/api/crops/catalog")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Rice" in data["data"]

def test_chat_endpoint():
    payload = {
        "message": "What crop should I grow in sandy soil with low rainfall?",
        "history": [],
        "context": {"location": "Chennai", "weather": "Sunny 28C"}
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
