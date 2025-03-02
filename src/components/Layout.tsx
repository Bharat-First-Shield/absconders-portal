import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  PlusCircle, 
  Search, 
  FileText, 
  BarChart3, 
  Shield, 
  Home, 
  Briefcase, 
  User, 
  Settings, 
  Menu, 
  X, 
  ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout() {
  const { user, logout, canEditCase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const quickActions = [
    { label: 'View Cases', icon: Briefcase, action: () => navigate('/cases') },
    { label: 'Search Records', icon: Search, action: () => navigate('/search') },
    { label: 'Generate Report', icon: FileText, action: () => navigate('/reports') },
    { label: 'View Analytics', icon: BarChart3, action: () => navigate('/analytics') },
  ];

  const navigationItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Cases', icon: Briefcase, path: '/cases' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Reports', icon: FileText, path: '/reports' },
  ];

  // Function to get breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    const breadcrumbs = [
      { label: 'Home', path: '/' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Special cases for specific paths
      if (segment === 'cases' && pathSegments[index + 1] === 'new') {
        label = 'Cases';
      } else if (segment === 'new' && pathSegments[index - 1] === 'cases') {
        label = 'Add New Case';
      }
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className={`bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:text-primary-600 transition-colors duration-200">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-8 h-8 text-primary-600" />
              </motion.div>
              <span className="text-xl font-bold">Absconders Portal</span>
            </Link>
            
            {/* Mobile menu button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors duration-200"
                aria-label={action.label}
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden md:inline">{action.label}</span>
              </motion.button>
            ))}
            
            <ThemeToggle />
            
            {user && (
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="User menu"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user.name}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </motion.button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 transition-transform origin-top-right duration-200 z-20">
                  <div className="p-3 border-b dark:border-gray-700">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-md overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    location.pathname === item.path
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-2 border-t dark:border-gray-700">
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <ThemeToggle />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                      aria-label="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-white">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}