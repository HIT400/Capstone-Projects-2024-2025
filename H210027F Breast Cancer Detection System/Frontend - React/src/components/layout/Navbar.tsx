
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, BarChart3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      className="w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 transition-opacity duration-300 hover:opacity-80"
            >
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <span className="font-display font-medium text-lg text-gray-900">Breast Cancer Detection System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive('/dashboard') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link 
                    to="/history" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive('/history') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600'
                    }`}
                  >
                    Patient History
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link 
                    to="/analysis" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive('/analysis') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline-block mr-1" />
                    Analysis
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link 
                    to="/appointments" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive('/appointments') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600'
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Appointments
                  </Link>
                </motion.div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="ml-4 text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600'
                  }`}
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-white border-t border-gray-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 pt-2 pb-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/history" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/history') ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Patient History
                </Link>
                <Link 
                  to="/analysis" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/analysis') ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-4 w-4 inline-block mr-2" />
                  Analysis
                </Link>
                <Link 
                  to="/appointments" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/appointments') ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar className="h-4 w-4 inline-block mr-2" />
                  Appointments
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
