import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { ELLY_COLORS } from '../App';
import { initAllAnimations, initParticleBackground } from '../utils/animations';
// Nous n'utilisons pas ces composants directement dans ce fichier
// car ils sont utilisés dans les composants importés comme PremiumFeatures
import {} from '../components/UIElements';
import PremiumFeatures from '../components/PremiumFeatures';
import StatisticsSection from '../components/StatisticsSection';
import PremiumFooter from '../components/PremiumFooter';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const t = useTranslation();
  
  const canvasRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    // Initialiser toutes les animations
    initAllAnimations();
    
    // Initialiser le fond de particules dans la section héro
    if (canvasRef.current) {
      initParticleBackground('particles-canvas', ELLY_COLORS.secondary, 80);
    }
    
    // Fonction pour suivre la position de défilement pour les effets parallax
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    // Ajouter l'écouteur d'événements pour le défilement
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <div className="home-container">
    {/* Section héro premium avec animation de particules et parallax */}
    <section className="hero-section relative overflow-hidden text-white mb-12">
      {/* Image de fond avec effet parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-out" 
        style={{
          backgroundImage: `url('/images/energy-broker-office.png')`,
          backgroundPosition: 'center 25%',
          transform: `scale(${1 + scrollPosition * 0.0003}) translateY(${scrollPosition * 0.1}px)`,
          filter: 'brightness(0.85)',
        }}
      ></div>
      
      {/* Overlay avec dégradé premium */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          background: `linear-gradient(135deg, rgba(0, 38, 87, 0.92) 0%, rgba(0, 38, 87, 0.8) 60%, rgba(50, 190, 91, 0.5) 100%)`,
          backdropFilter: 'blur(1px)',
          mixBlendMode: 'multiply'
        }}
      ></div>
      
      {/* Canvas pour l'animation de particules */}
      <canvas id="particles-canvas" ref={canvasRef} className="absolute inset-0 z-20 opacity-40"></canvas>
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-20 pb-16 md:pt-32 md:pb-28 lg:pb-32 xl:pb-36 flex flex-col lg:flex-row items-center">
          {/* Contenu texte */}
          <div className="lg:w-1/2 lg:mr-12 mb-12 lg:mb-0 animate-on-scroll" data-animation="fade-right">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-white bg-opacity-20 text-white backdrop-blur-sm transform transition-transform duration-500 hover:scale-105">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Solutions personnalisées pour courtiers en énergie
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              <span className="block">{t.homeTitle}</span>
              <span className="block mt-3 text-yellow-300">{t.homeSubtitle}</span>
            </h1>
            
            <p className="mt-6 text-lg text-white text-opacity-90 max-w-3xl font-light leading-relaxed">
              {t.homeDescription}
            </p>
            
            {/* Cards - Stats */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-15">
                <div className="text-2xl font-bold text-white">+150</div>
                <div className="text-sm text-white text-opacity-80">Templates optimisés</div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-15">
                <div className="text-2xl font-bold text-white">96%</div>
                <div className="text-sm text-white text-opacity-80">Clients satisfaits</div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/templates"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full text-primary-900 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  style={{ boxShadow: ELLY_COLORS.shadowPrimary }}
                >
                  <span className="font-bold" style={{ color: ELLY_COLORS.primary }}>{t.myTemplates}</span>
                  <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" style={{ stroke: ELLY_COLORS.primary }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full text-primary-900 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    style={{ boxShadow: ELLY_COLORS.shadowPrimary }}
                  >
                    <span className="font-bold" style={{ color: ELLY_COLORS.primary }}>{t.login}</span>
                    <svg className="ml-2 w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" style={{ stroke: ELLY_COLORS.primary }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-white text-base font-medium rounded-full text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    <span className="font-bold">{t.register}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Image */}
          <div className="lg:w-1/2 animate-on-scroll" data-animation="fade-left">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02] hover:rotate-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-800 to-secondary-500 mix-blend-multiply opacity-10"></div>
              <img
                className="w-full h-auto object-cover rounded-2xl"
                src="https://replicate.delivery/xezq/pzfp3vGPebq5rk2fNNf4bHVhNfWuPOMF3edmmw1ntZojpPLMF/tmp0vl38a41.png"
                alt="Solutions pour courtiers en énergie"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-24 opacity-60"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                <div>
                  <div className="text-sm font-semibold">Découvrez notre expertise</div>
                  <div className="text-xs opacity-80">Optimisez vos présentations client</div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded-full backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Banner sous le hero */}
        <div className="flex flex-wrap justify-between items-center -mx-4 py-6 border-t border-white border-opacity-20">
          <div className="w-full md:w-auto px-4 mb-4 md:mb-0 text-center md:text-left">
            <span className="text-white text-opacity-90 text-sm font-medium">Optimisez vos échanges commerciaux avec des modèles personnalisés</span>
          </div>
          <div className="w-full md:w-auto px-4 flex flex-wrap justify-center md:justify-start">
            <div className="flex items-center mx-3 mb-3 md:mb-0">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white text-opacity-90 text-sm">Export PDF/PPT</span>
            </div>
            <div className="flex items-center mx-3 mb-3 md:mb-0">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white text-opacity-90 text-sm">Partage simplifié</span>
            </div>
            <div className="flex items-center mx-3 mb-3 md:mb-0">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white text-opacity-90 text-sm">Données énergie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    {/* Section Premium Features avec design ultra-moderne */}
    <PremiumFeatures />
    
    {/* Section Témoignages Premium */}
    <section className="py-24 relative overflow-hidden">
      {/* Contenu des témoignages - déjà en composant */}
    </section>
    
    {/* CTA Section - Inspiré de MonCourtierEnergie.com */}
    <section className="relative overflow-hidden py-24 animate-on-scroll" data-animation="fade-up">
      {/* Contenu CTA - déjà en composant */}
    </section>
    
    {/* Section Statistiques Professionnelles */}
    <StatisticsSection />
    
    {/* Call-to-action Section Ultra Premium */}
    <section className="relative py-24 overflow-hidden">
      {/* Contenu CTA - déjà en composant */}
    </section>
    
    {/* Pied de page premium */}
    <PremiumFooter />
  </div>

  );
};

export default Home;