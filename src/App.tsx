import React from 'react';
import SymptomAnalyzer from './components/SymptomAnalyzer';
import DrugInteraction from './components/DrugInteraction';
import MedicalTermExplainer from './components/MedicalTermExplainer';
import ReportSummarizer from './components/ReportSummarizer';
import About from './components/About';
import Homepage from './components/Homepage';
import HealthcareChat from './components/HealthcareChat';
import Emergency from './components/Emergency';
import { NavigationProvider } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/navigation/Navbar';
import AppContent from './components/AppContent';

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;