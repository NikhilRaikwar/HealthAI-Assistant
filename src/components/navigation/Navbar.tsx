import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLogo } from './NavLogo';
import { NavItem } from './NavItem';
import { MobileMenu } from './MobileMenu';
import { navigationItems } from '../../config/navigation';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <NavLogo />

            <nav className="hidden lg:flex lg:items-center lg:justify-end space-x-2">
              {navigationItems.map((item) => (
                <NavItem key={item.id} {...item} />
              ))}
            </nav>

            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}