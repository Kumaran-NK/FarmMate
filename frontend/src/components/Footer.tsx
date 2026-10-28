import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-green-100 text-gray-500 text-xs py-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Platform Branding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <img
                src="/farmmate-logo.png"
                alt="FarmMate Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold text-green-800">FarmMate</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Full-Stack Agricultural Intelligence & Agronomic Decision Support Platform powered by Machine Learning and Real-time Telemetry.
            </p>
          </div>

          {/* Col 2: Core ML Capabilities */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 uppercase tracking-wider text-[11px]">Core Features</h4>
            <ul className="space-y-2 text-gray-500">
              <li>Smart Crop Recommendation</li>
              <li>Fertilizer Advisory System</li>
              <li>FAO-56 ET0 Water Management</li>
              <li>XGBoost Frost Risk Evaluation</li>
            </ul>
          </div>

          {/* Col 3: Predictive Analytics */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 uppercase tracking-wider text-[11px]">Market & Climate</h4>
            <ul className="space-y-2 text-gray-500">
              <li>OpenWeather Telemetry</li>
              <li>Rain AI Classifier</li>
              <li>Harvest Yield Estimator</li>
              <li>Vegetable Mandi Price Forecast</li>
            </ul>
          </div>

          {/* Col 4: Technology & AI */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 uppercase tracking-wider text-[11px]">Architecture</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">React 18</span>
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">FastAPI</span>
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">Groq AI</span>
              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">Leaflet</span>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-green-100 flex flex-col sm:flex-row justify-between items-center text-gray-400 gap-4">
          <p>© 2026 FarmMate Agricultural Intelligence Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Empowering modern farmers with data science</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
