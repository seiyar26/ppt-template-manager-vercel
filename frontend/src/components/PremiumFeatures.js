import React from 'react';
import { ELLY_COLORS } from '../App';

const PremiumFeatures = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden bg-white">
      {/* Fond géométrique sophistiqué */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={ELLY_COLORS.primary} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
        </svg>
      </div>

      {/* Cercles décoratifs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" 
           style={{ background: `radial-gradient(circle, ${ELLY_COLORS.secondary} 0%, rgba(50,190,91,0) 70%)` }}></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" 
           style={{ background: `radial-gradient(circle, ${ELLY_COLORS.primary} 0%, rgba(0,38,87,0) 70%)` }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* En-tête de section premium */}
        <div className="text-center mb-16 animate-on-scroll" data-animation="fade-up">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium shadow-sm mb-3" 
               style={{ color: ELLY_COLORS.secondary, backgroundColor: 'rgba(50, 190, 91, 0.08)' }}>
            SOLUTIONS POUR COURTIERS EN ÉNERGIE
          </div>
          
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-3">
            <span className="block">Fonctionnalités premium pour</span>
            <span className="bg-clip-text text-transparent" 
                  style={{ background: ELLY_COLORS.gradient }}>
              professionnels de l'énergie
            </span>
          </h2>
          
          <p className="max-w-3xl mx-auto text-xl text-gray-500">
            Des outils spécifiquement conçus pour optimiser votre activité de courtage en énergie et impressionner vos clients.
          </p>
        </div>

        {/* Grille de fonctionnalités premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Fonctionnalité 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] relative animate-on-scroll" 
               data-animation="fade-up" 
               style={{ boxShadow: ELLY_COLORS.shadowPrimary }}>
            <div className="absolute -top-5 left-8 flex items-center justify-center h-12 w-12 rounded-lg text-white shadow-lg" 
                 style={{ background: ELLY_COLORS.gradient }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div className="pt-8 pb-2">
              <h3 className="text-xl font-bold mb-3" style={{ color: ELLY_COLORS.primary }}>Templates dynamiques</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Des modèles de présentation personnalisés pour chaque segment de marché énergétique avec mise à jour automatique des données.
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Adaptation automatique à chaque client</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Variables personnalisables illimitées</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Conception respectant votre charte graphique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fonctionnalité 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] relative animate-on-scroll" 
               data-animation="fade-up" 
               style={{ boxShadow: ELLY_COLORS.shadowPrimary, animationDelay: '0.2s' }}>
            <div className="absolute -top-5 left-8 flex items-center justify-center h-12 w-12 rounded-lg text-white shadow-lg" 
                 style={{ background: ELLY_COLORS.gradient }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <div className="pt-8 pb-2">
              <h3 className="text-xl font-bold mb-3" style={{ color: ELLY_COLORS.primary }}>Données énergétiques</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Accédez à des graphiques et analyses du marché de l'énergie actualisés pour renforcer l'impact de vos présentations.
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Graphiques interactifs personnalisables</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Mises à jour automatiques des prix</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Comparatifs sectoriels pertinents</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fonctionnalité 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] relative animate-on-scroll" 
               data-animation="fade-up" 
               style={{ boxShadow: ELLY_COLORS.shadowPrimary, animationDelay: '0.4s' }}>
            <div className="absolute -top-5 left-8 flex items-center justify-center h-12 w-12 rounded-lg text-white shadow-lg" 
                 style={{ background: ELLY_COLORS.gradient }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            
            <div className="pt-8 pb-2">
              <h3 className="text-xl font-bold mb-3" style={{ color: ELLY_COLORS.primary }}>Distribution intelligente</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Partagez instantanément vos présentations avec vos clients via différents canaux, tout en suivant leur engagement.
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Partage sécurisé par lien ou email</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Notification de consultation en temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: ELLY_COLORS.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-500">Export multi-formats (PDF, PPT, Web)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bannière d'appel à l'action premium */}
        <div className="relative overflow-hidden rounded-2xl animate-on-scroll" data-animation="fade-up">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-900 opacity-95" 
               style={{ background: ELLY_COLORS.gradient }}></div>
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '24px 24px'
          }}></div>
          
          <div className="relative px-6 py-12 md:py-16 md:px-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Prêt à révolutionner vos présentations client ?</h3>
            <p className="max-w-3xl mx-auto text-lg mb-8 opacity-90">
              Rejoignez les courtiers en énergie qui transforment leurs présentations PowerPoint en véritables outils de vente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 rounded-full bg-white text-primary-600 font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105" 
                      style={{ color: ELLY_COLORS.primary }}>
                Commencer gratuitement
              </button>
              <button className="px-8 py-4 rounded-full bg-transparent border-2 border-white font-bold hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                Voir une démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
