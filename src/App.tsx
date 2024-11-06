import React, { useState } from 'react';
import { Menu, X, Stethoscope, Pill, BookOpen, FileText, Info } from 'lucide-react';
import SymptomAnalyzer from './components/SymptomAnalyzer';
import DrugInteraction from './components/DrugInteraction';
import MedicalTermExplainer from './components/MedicalTermExplainer';
import ReportSummarizer from './components/ReportSummarizer';
import About from './components/About';
import HealthcareLogo from './components/HealthcareLogo';

function App() {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'symptoms', name: 'Symptom Analyzer', icon: Stethoscope },
    { id: 'drugs', name: 'Drug Interactions', icon: Pill },
    { id: 'terms', name: 'Medical Terms', icon: BookOpen },
    { id: 'reports', name: 'Report Summarizer', icon: FileText },
    { id: 'about', name: 'About', icon: Info },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'symptoms':
        return <SymptomAnalyzer />;
      case 'drugs':
        return <DrugInteraction />;
      case 'terms':
        return <MedicalTermExplainer />;
      case 'reports':
        return <ReportSummarizer />;
      case 'about':
        return <About />;
      default:
        return <SymptomAnalyzer />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  <HealthcareLogo className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">HealthAI Assistant</h1>
                <p className="text-xs sm:text-sm text-gray-500">Your Personal Health Analysis Tool</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:justify-end lg:flex-1 lg:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-900'
                    } flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 -mb-[2px]`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <HealthcareLogo className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="font-semibold text-gray-900">HealthAI Assistant</span>
                  <p className="text-sm text-gray-500">Your Health Analysis Tool</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } group flex items-center w-full px-3 py-2 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl animate-fadeIn">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <HealthcareLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base">HealthAI Assistant</span>
            <span className="text-gray-500 text-xs sm:text-sm">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;