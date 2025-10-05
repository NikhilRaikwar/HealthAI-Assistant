import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLogo } from './NavLogo';
import { MobileMenu } from './MobileMenu';
import { navigationItems } from '../../config/navigation';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useNavigationContext } from '../../context/NavigationContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab } = useNavigationContext();
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <NavLogo />

            <nav className="hidden lg:flex lg:items-center lg:space-x-2">
              {navigationItems.map((item) => (
                <NavigationMenu key={item.id}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      {item.dropdown ? (
                        <>
                          <NavigationMenuTrigger 
                            className={cn(
                              "bg-transparent",
                              (activeTab === item.id || item.dropdown?.some(subItem => subItem.id === activeTab))
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300"
                            )}
                          >
                            <item.icon className="mr-1.5 h-5 w-5" />
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="!left-0">
                            <ul className="grid w-[240px] gap-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                              {item.dropdown.map((subItem) => (
                                <li key={subItem.id}>
                                  <NavigationMenuLink asChild>
                                    <button
                                      onClick={() => setActiveTab(subItem.id)}
                                      className={cn(
                                        "flex w-full items-center rounded-md p-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                                        activeTab === subItem.id
                                          ? "bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-400"
                                          : "text-gray-700 dark:text-gray-300"
                                      )}
                                    >
                                      <subItem.icon className="mr-2 h-5 w-5" />
                                      <span className="font-medium">{subItem.name}</span>
                                    </button>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "bg-transparent",
                              activeTab === item.id
                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <item.icon className="mr-1.5 h-5 w-5" />
                            {item.name}
                          </button>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ))}
              <AnimatedThemeToggler className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" />
            </nav>

            <div className="flex lg:hidden items-center space-x-2">
              <AnimatedThemeToggler className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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