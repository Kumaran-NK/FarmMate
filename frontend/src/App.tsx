import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FarmProvider } from './context/FarmContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Dashboard } from './pages/Dashboard';
import { CropAdvisor } from './pages/CropAdvisor';
import { FertilizerAdvisor } from './pages/FertilizerAdvisor';
import { WeatherPage } from './pages/WeatherPage';
import { FrostRiskPage } from './pages/FrostRiskPage';
import { WaterManagement } from './pages/WaterManagement';
import { YieldPredictionPage } from './pages/YieldPrediction';
import { MarketPricesPage } from './pages/MarketPrices';
import { AIAssistant } from './pages/AIAssistant';

export const App: React.FC = () => {
  return (
    <FarmProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crop-advisor" element={<CropAdvisor />} />
              <Route path="/fertilizer-advisor" element={<FertilizerAdvisor />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/frost-risk" element={<FrostRiskPage />} />
              <Route path="/water-management" element={<WaterManagement />} />
              <Route path="/yield-prediction" element={<YieldPredictionPage />} />
              <Route path="/market-prices" element={<MarketPricesPage />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </FarmProvider>
  );
};

export default App;
