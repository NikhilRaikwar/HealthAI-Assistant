import React from 'react';
import { X } from 'lucide-react';
import { NavItem } from './NavItem';
import { navigationItems } from '../../config/navigation';
import HealthcareLogo from '../HealthcareLogo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <HealthcareLogo className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-200">HealthAI Assistant</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                isMobile={true}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}