import React from 'react';
import { ELLY_COLORS } from '../App';

// Badge premium avec animation subtile
export const PremiumBadge = ({ children, className = '', theme = 'primary', size = 'md' }) => {
  const themeStyles = {
    primary: {
      bg: 'bg-white bg-opacity-20',
      text: 'text-white',
      border: 'border-white border-opacity-20'
    },
    secondary: {
      bg: `bg-opacity-10`,
      text: `text-${ELLY_COLORS.secondary}`,
      border: 'border-green-200'
    },
    accent: {
      bg: `bg-white`,
      text: `text-${ELLY_COLORS.primary}`,
      border: 'border-white'
    },
    light: {
      bg: 'bg-white bg-opacity-90',
      text: `text-${ELLY_COLORS.primary}`,
      border: 'border-gray-100'
    }
  };

  const sizeStyles = {
    sm: 'text-xs py-1 px-2.5',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-bold backdrop-blur-sm 
                 border border-opacity-40 shadow-sm transform transition-all duration-500 
                 hover:scale-105 ${themeStyles[theme].bg} ${themeStyles[theme].text} 
                 ${themeStyles[theme].border} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Carte avec effet glassmorphism
export const GlassCard = ({ children, className = '', hover = true }) => {
  return (
    <div 
      className={`bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg 
                 rounded-xl border border-white border-opacity-20 
                 shadow-xl overflow-hidden ${className} 
                 ${hover ? 'transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl' : ''}`}
    >
      {children}
    </div>
  );
};

// Bouton premium animé
export const PremiumButton = ({ 
  children, 
  onClick, 
  className = '', 
  theme = 'primary', 
  size = 'md', 
  rounded = 'full', 
  withIcon = true 
}) => {
  const themeStyles = {
    primary: {
      bg: `background: ${ELLY_COLORS.gradient}`,
      text: 'text-white',
      hover: 'hover:shadow-lg hover:shadow-blue-500/20'
    },
    secondary: {
      bg: `background-color: ${ELLY_COLORS.secondary}`,
      text: 'text-white',
      hover: 'hover:shadow-lg hover:shadow-green-500/20'
    },
    accent: {
      bg: `background-color: ${ELLY_COLORS.accent}`,
      text: `text-${ELLY_COLORS.dark}`,
      hover: 'hover:shadow-lg hover:shadow-yellow-500/20'
    },
    white: {
      bg: 'bg-white',
      text: `text-${ELLY_COLORS.primary}`,
      hover: 'hover:shadow-lg hover:shadow-blue-500/10'
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-white',
      hover: 'hover:bg-white hover:bg-opacity-10'
    }
  };

  const sizeStyles = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-2.5 px-6',
    lg: 'text-lg py-3 px-8',
    xl: 'text-lg py-4 px-10'
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  return (
    <button 
      onClick={onClick} 
      className={`inline-flex items-center justify-center font-medium
                 shadow-md transition-all duration-300 transform 
                 active:scale-95 ${themeStyles[theme].text} 
                 ${themeStyles[theme].hover} ${sizeStyles[size]} 
                 ${roundedStyles[rounded]} ${className} group`}
      style={{ [themeStyles[theme].bg]: true }}
    >
      {children}
      {withIcon && (
        <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24" 
             xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )}
    </button>
  );
};

// En-tête de section élégante
export const SectionHeader = ({ title, subtitle, highlight, badge, className = '' }) => {
  return (
    <div className={`text-center mb-16 animate-on-scroll ${className}`} data-animation="fade-up">
      {badge && (
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium shadow-sm mb-3" 
             style={{ color: ELLY_COLORS.secondary, backgroundColor: 'rgba(50, 190, 91, 0.08)' }}>
          {badge}
        </div>
      )}
      
      <h2 className="text-3xl font-extrabold sm:text-4xl mb-6 tracking-tight">
        {title && <span className="block">{title}</span>}
        {highlight && (
          <span className="bg-clip-text text-transparent" 
                style={{ background: ELLY_COLORS.gradient }}>
            {highlight}
          </span>
        )}
      </h2>
      
      {subtitle && (
        <p className="max-w-3xl mx-auto text-xl text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Statistique animée
export const AnimatedStat = ({ value, label, theme = 'light', className = '' }) => {
  const themeStyles = {
    light: 'bg-white bg-opacity-10 text-white',
    dark: `bg-white shadow-md text-${ELLY_COLORS.primary}`
  };
  
  return (
    <div 
      className={`${themeStyles[theme]} backdrop-blur-sm rounded-xl p-4 transform 
                 transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
};

// Icône avec cercle
export const CircleIcon = ({ icon, theme = 'primary', className = '' }) => {
  const themeStyles = {
    primary: { background: ELLY_COLORS.gradient },
    secondary: { backgroundColor: ELLY_COLORS.secondary },
    accent: { backgroundColor: ELLY_COLORS.accent },
    white: 'bg-white'
  };
  
  return (
    <div 
      className={`flex items-center justify-center h-12 w-12 rounded-full shadow-lg ${className} 
                 ${theme === 'white' ? themeStyles.white : ''}`}
      style={theme !== 'white' ? themeStyles[theme] : {}}
    >
      {icon}
    </div>
  );
};

// Conteneur avec vagues de fond
export const WaveContainer = ({ children, className = '', theme = 'primary' }) => {
  const themeStyles = {
    primary: { background: ELLY_COLORS.gradient },
    secondary: { background: `linear-gradient(135deg, ${ELLY_COLORS.secondary} 0%, ${ELLY_COLORS.primary} 100%)` },
    light: { background: ELLY_COLORS.lightGradient }
  };
  
  return (
    <div className={`relative overflow-hidden py-24 ${className}`}>
      <div className="absolute inset-0" style={themeStyles[theme]}></div>
      
      <svg className="absolute bottom-0 left-0 w-full text-white opacity-10" 
           viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" 
           preserveAspectRatio="none">
        <path 
          fill="currentColor" 
          d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
        </path>
      </svg>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const FeatureItem = ({ icon, title, description, benefits = [], className = '' }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg p-8 transform transition-all 
                 duration-500 hover:shadow-xl hover:scale-[1.02] relative animate-on-scroll ${className}`} 
      data-animation="fade-up" 
      style={{ boxShadow: ELLY_COLORS.shadowPrimary }}
    >
      {icon && (
        <div 
          className="absolute -top-5 left-8 flex items-center justify-center h-12 w-12 rounded-lg text-white shadow-lg" 
          style={{ background: ELLY_COLORS.gradient }}
        >
          {icon}
        </div>
      )}
      
      <div className="pt-8 pb-2">
        <h3 className="text-xl font-bold mb-3" style={{ color: ELLY_COLORS.primary }}>{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
        
        {benefits.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li className="flex items-start" key={index}>
                  <svg 
                    className="h-5 w-5 mr-2 flex-shrink-0" 
                    style={{ color: ELLY_COLORS.secondary }} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-500">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Exporter tous les composants
export default {
  PremiumBadge,
  GlassCard,
  PremiumButton,
  SectionHeader,
  AnimatedStat,
  CircleIcon,
  WaveContainer,
  FeatureItem
};
