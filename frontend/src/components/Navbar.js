import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { ELLY_COLORS } from '../App';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const t = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false); // Close mobile menu when route changes
  }, [location]);

  return (
    <nav className={`text-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 shadow-lg' : 'py-3'}`} 
         style={{ background: scrolled ? ELLY_COLORS.primary : ELLY_COLORS.gradient }}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <img 
            src="https://replicate.delivery/xezq/oT8iQDVEWl7lHJBWfoS26cBKwSqolqjVOuEyxWlULx6YfswUA/tmpuw1q33fp.png" 
            alt="Logo Énergie" 
            className="h-10 w-10 mr-3 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight leading-none">{t.appName}</span>
            <span className="text-xs font-semibold opacity-80 tracking-wider">COURTIER EN ÉNERGIE</span>
          </div>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-opacity-20 hover:bg-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          {isAuthenticated ? (
            <>
              <div className="border-r border-white border-opacity-20 pr-4 mr-4">
                <span className="text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{user.name}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  to="/templates" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out hover:bg-white hover:bg-opacity-10 flex items-center group ${location.pathname === '/templates' ? 'bg-white bg-opacity-10 font-semibold' : ''}`}
                >
                  <svg className="w-4 h-4 mr-1.5 group-hover:text-green-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.myTemplates}
                </Link>
                <Link 
                  to="/categories" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out hover:bg-white hover:bg-opacity-10 flex items-center group ${location.pathname === '/categories' ? 'bg-white bg-opacity-10 font-semibold' : ''}`}
                >
                  <svg className="w-4 h-4 mr-1.5 group-hover:text-green-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  {t.categories}
                </Link>
                <Link 
                  to="/exports" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out hover:bg-white hover:bg-opacity-10 flex items-center group ${location.pathname === '/exports' ? 'bg-white bg-opacity-10 font-semibold' : ''}`}
                >
                  <svg className="w-4 h-4 mr-1.5 group-hover:text-green-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.exportHistory}
                </Link>
              </div>
              
              <button
                onClick={logout}
                style={{ backgroundColor: ELLY_COLORS.accent }}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium shadow-md flex items-center transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-1px]"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">{t.logout}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white text-primary-700 hover:bg-opacity-90 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all duration-300 flex items-center space-x-2 group" style={{ color: ELLY_COLORS.primary }}>
                <span>{t.login}</span>
                <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu - with animation */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-primary-900 bg-opacity-95 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: ELLY_COLORS.gradientLight }}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-full -mt-16">
          <img 
            src="https://replicate.delivery/xezq/oT8iQDVEWl7lHJBWfoS26cBKwSqolqjVOuEyxWlULx6YfswUA/tmpuw1q33fp.png" 
            alt="Logo Énergie" 
            className="h-16 w-16 mb-8 object-contain animate-pulse" 
          />
          
          {isAuthenticated ? (
            <div className="space-y-6 flex flex-col items-center">
              <div className="text-white text-center mb-4">
                <span className="flex items-center justify-center text-lg font-medium mb-1">
                  <svg className="w-5 h-5 mr-2 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.name}
                </span>
                <div className="h-0.5 w-16 bg-white bg-opacity-20 mx-auto my-3"></div>
              </div>
              
              <Link to="/templates" className="flex items-center text-xl font-medium text-white hover:text-green-300 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.myTemplates}
              </Link>
              
              <Link to="/categories" className="flex items-center text-xl font-medium text-white hover:text-green-300 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                {t.categories}
              </Link>
              
              <Link to="/exports" className="flex items-center text-xl font-medium text-white hover:text-green-300 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.exportHistory}
              </Link>
              
              <div className="mt-6 pt-4 border-t border-white border-opacity-20 w-full flex justify-center">
                <button
                  onClick={logout}
                  style={{ backgroundColor: ELLY_COLORS.accent }}
                  className="px-8 py-3 rounded-full text-gray-900 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 flex flex-col items-center">
              <Link to="/login" className="bg-white px-8 py-3.5 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center" style={{ color: ELLY_COLORS.primary }}>
                {t.login}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              {/* Lien d'inscription supprimé */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;