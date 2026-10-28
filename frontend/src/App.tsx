import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { FarmProvider } from './context/FarmContext';
import { VoiceProvider } from './context/VoiceContext';
import { Sidebar, TopBar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { VoiceFAB } from './components/VoiceFAB';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CropAdvisor } from './pages/CropAdvisor';
import { FertilizerAdvisor } from './pages/FertilizerAdvisor';
import { WeatherPage } from './pages/WeatherPage';
import { FrostRiskPage } from './pages/FrostRiskPage';
import { WaterManagement } from './pages/WaterManagement';
import { YieldPredictionPage } from './pages/YieldPrediction';
import { MarketPricesPage } from './pages/MarketPrices';
import { AIAssistant } from './pages/AIAssistant';
import { AlertSettings } from './pages/AlertSettings';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8faf5] text-[#1a2e1a] antialiased selection:bg-green-200 selection:text-green-900">
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7f2] text-[#1a2e1a] antialiased selection:bg-green-200 selection:text-green-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="flex flex-col flex-1 ml-[240px] transition-all duration-300">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-8 pt-6 pb-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crop-advisor" element={<CropAdvisor />} />
            <Route path="/fertilizer" element={<FertilizerAdvisor />} />
            <Route path="/fertilizer-advisor" element={<FertilizerAdvisor />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/frost-risk" element={<FrostRiskPage />} />
            <Route path="/water-management" element={<WaterManagement />} />
            <Route path="/yield-prediction" element={<YieldPredictionPage />} />
            <Route path="/market-prices" element={<MarketPricesPage />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/alerts" element={<AlertSettings />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Global Voice FAB */}
      <VoiceFAB />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FarmProvider>
      <VoiceProvider>
        <Router>
          <AppContent />
        </Router>
      </VoiceProvider>
    </FarmProvider>
  );
};

export default App;
