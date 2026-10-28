"""Quick test: verify the /api/weather/predict endpoint works with lat/lon coordinates (map click simulation)."""
import requests

BASE = "http://localhost:8000"

# --- 1. Health check ---
r = requests.get(f"{BASE}/health", timeout=5)
print(f"Health: {r.status_code} -> {r.json()}")

# --- 2. Weather by coordinates (simulates clicking Bengaluru on the map) ---
payload = {"city_name": "", "lat": 12.9716, "lon": 77.5946}
r = requests.post(f"{BASE}/api/weather/predict", json=payload, timeout=20)
print(f"\nWeather by coords (Bengaluru) - Status: {r.status_code}")
if r.status_code == 200:
    data = r.json().get("data", {})
    cw = data.get("current_weather", {})
    rp = data.get("rain_prediction", {})
    print(f"  City resolved : {cw.get('city')}, {cw.get('country')}")
    print(f"  Temperature   : {cw.get('temp')}°C (feels like {cw.get('feels_like')}°C)")
    print(f"  Humidity      : {cw.get('humidity')}%")
    print(f"  Description   : {cw.get('description')}")
    print(f"  Lat/Lon       : {cw.get('lat')}, {cw.get('lon')}")
    print(f"  Rain Prob     : {rp.get('probability')} -> {rp.get('advice')}")
    print("\n✅ Map click -> weather update: WORKING!")
else:
    print(f"  ERROR: {r.text}")
    print("\n❌ Weather coordinate fetch FAILED")

# --- 3. Weather by another coord (simulates clicking Chennai) ---
payload2 = {"city_name": "", "lat": 13.0827, "lon": 80.2707}
r2 = requests.post(f"{BASE}/api/weather/predict", json=payload2, timeout=20)
print(f"\nWeather by coords (Chennai) - Status: {r2.status_code}")
if r2.status_code == 200:
    cw2 = r2.json().get("data", {}).get("current_weather", {})
    print(f"  City resolved : {cw2.get('city')}, {cw2.get('country')}")
    print(f"  Temperature   : {cw2.get('temp')}°C")
    print(f"  Humidity      : {cw2.get('humidity')}%")
else:
    print(f"  ERROR: {r2.text}")
