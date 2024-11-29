import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import { NavItem as NavItemType } from '../../config/navigation';

interface NavItemProps extends NavItemType {
  isMobile?: boolean;
}

export function NavItem({ id, name, icon: Icon, dropdown, isMobile = false }: NavItemProps) {
  const { activeTab, setActiveTab } = useNavigationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (dropdown) {
      setIsOpen(prev => !prev); // Toggle dropdown on click for mobile
    } else {
      setActiveTab(id);
      setIsOpen(false); // Close dropdown if it's not a dropdown item
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false); // Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isMobile) {
      const handleMouseEnter = () => setIsOpen(true);
      const handleMouseLeave = () => setIsOpen(false);

      const dropdownElement = dropdownRef.current;
      if (dropdownElement) {
        dropdownElement.addEventListener('mouseenter', handleMouseEnter);
        dropdownElement.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        if (dropdownElement) {
          dropdownElement.removeEventListener('mouseenter', handleMouseEnter);
          dropdownElement.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [dropdownRef, isMobile]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className={`${
          activeTab === id || (dropdown?.some(item => item.id === activeTab))
            ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-gray-800'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
        } flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-all duration-200`}
      >
        <div className="flex items-center">
          <Icon className={`mr-1.5 h-5 w-5 ${
            activeTab === id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
          }`} />
          {name}
        </div>
        {dropdown && (
          <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {dropdown && isOpen && (
        <div className="absolute z-50 left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {dropdown.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close dropdown after selection
                }}
                className={`${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  activeTab === item.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'
                }`} />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}