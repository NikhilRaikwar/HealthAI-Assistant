import React from 'react';
import { useNavigationContext } from '../context/NavigationContext';
import SymptomAnalyzer from './SymptomAnalyzer';
import DrugInteraction from './DrugInteraction';
import MedicalTermExplainer from './MedicalTermExplainer';
import ReportSummarizer from './ReportSummarizer';
import PolicyQueryAssistant from './PolicyQueryAssistant';
import About from './About';
import Homepage from './Homepage';
import HealthcareChat from './HealthcareChat';
import Emergency from './Emergency';
import MedicalImageAnalyzer from './MedicalImageAnalyzer';
import MedicineAnalyzer from './MedicineAnalyzer';
import { Navbar } from './navigation/Navbar';
import HealthcareLogo from './HealthcareLogo';

export default function AppContent() {
  const { activeTab } = useNavigationContext();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Homepage />;
      case 'symptoms':
        return <SymptomAnalyzer />;
      case 'drugs':
        return <DrugInteraction />;
      case 'terms':
        return <MedicalTermExplainer />;
      case 'reports':
        return <ReportSummarizer />;
      case 'policy':
        return <PolicyQueryAssistant />;
      case 'chat':
        return <HealthcareChat />;
      case 'emergency':
        return <Emergency />;
      case 'medical-image':
        return <MedicalImageAnalyzer />;
      case 'medicine':
        return <MedicineAnalyzer />;
      case 'about':
        return <About />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full animate-fadeIn">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <HealthcareLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">HealthAI Assistant</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}