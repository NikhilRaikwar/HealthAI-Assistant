import React from 'react';
import HealthcareLogo from '../HealthcareLogo';
import { useNavigationContext } from '../../context/NavigationContext';

export function NavLogo() {
  const { setActiveTab } = useNavigationContext();

  return (
    <div 
      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200" 
      onClick={() => setActiveTab('home')}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
          <HealthcareLogo className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="ml-3 mr-8">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-200">HealthAI Assistant</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your Personal Health Analysis Tool</p>
      </div>
    </div>
  );
}