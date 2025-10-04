import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routeMap, pathToIdMap } from '../config/routes';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(() => {
    return pathToIdMap[location.pathname] || 'home';
  });

  // Sync activeTab with current URL
  useEffect(() => {
    const id = pathToIdMap[location.pathname] || 'home';
    setActiveTabState(id);
  }, [location.pathname]);

  // Navigate to the corresponding route when activeTab changes
  const setActiveTab = (tab: string) => {
    const path = routeMap[tab] || '/';
    navigate(path);
    setActiveTabState(tab);
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
}