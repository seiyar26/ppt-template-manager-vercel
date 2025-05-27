import React from 'react';
import { Link } from 'react-router-dom';
import { ELLY_COLORS } from '../App';

const PremiumFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-white overflow-hidden border-t border-gray-100">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 rounded-full" 
           style={{ background: `radial-gradient(circle, rgba(50,190,91,0.05) 0%, rgba(50,190,91,0) 70%)` }}></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 transform translate-x-1/2 translate-y-1/2 rounded-full" 
           style={{ background: `radial-gradient(circle, rgba(0,38,87,0.05) 0%, rgba(0,38,87,0) 70%)` }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo et à propos */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg shadow-md mr-3 flex items-center justify-center" 
                   style={{ background: ELLY_COLORS.gradient }}>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold" style={{ color: ELLY_COLORS.primary }}>PowerBroker</span>
            </div>
            
            <p className="text-gray-500 mb-6 leading-relaxed">
              Solutions premium de gestion de templates PowerPoint pour les courtiers en énergie, optimisant les présentations client et augmentant les taux de conversion.
            </p>
            
            <div className="flex space-x-4">
              <a href="https://linkedin.com" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center transition-all hover:bg-gray-200">
                <svg className="h-5 w-5" style={{ color: ELLY_COLORS.primary }} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://twitter.com" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center transition-all hover:bg-gray-200">
                <svg className="h-5 w-5" style={{ color: ELLY_COLORS.primary }} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="https://facebook.com" className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center transition-all hover:bg-gray-200">
                <svg className="h-5 w-5" style={{ color: ELLY_COLORS.primary }} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.126-5.863 10.126-11.854z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Liens rapides */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-lg font-bold mb-6" style={{ color: ELLY_COLORS.primary }}>Liens rapides</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Nos templates
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Ressources */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-lg font-bold mb-6" style={{ color: ELLY_COLORS.primary }}>Ressources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/blog" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Blog énergie
                </Link>
              </li>
              <li>
                <Link to="/webinars" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Webinaires
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Guides PDF
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-500 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-lg font-bold mb-6" style={{ color: ELLY_COLORS.primary }}>Newsletter énergie</h3>
            <p className="text-gray-500 mb-6">
              Recevez nos dernières actualités et tendances du marché de l'énergie.
            </p>
            
            <div className="flex">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                className="px-4 py-3 rounded-r-lg text-white font-medium"
                style={{ background: ELLY_COLORS.gradient }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              En vous inscrivant, vous acceptez notre politique de confidentialité et de recevoir des emails.
            </p>
          </div>
        </div>
        
        {/* Ligne de séparation */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} PowerBroker™. Tous droits réservés. Conçu pour les courtiers en énergie.
          </p>
          
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-900 text-sm">
              Conditions
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-gray-900 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
