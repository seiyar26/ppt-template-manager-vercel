import React from 'react';
import { ELLY_COLORS } from '../App';

const StatisticsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Fond avec dégradé premium */}
      <div className="absolute inset-0" style={{ background: ELLY_COLORS.gradient }}></div>
      
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="text-center mb-16 animate-on-scroll" data-animation="fade-up">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white bg-opacity-20 shadow-sm backdrop-blur-sm mb-4">
            EN QUELQUES CHIFFRES
          </div>
          
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6 tracking-tight">
            <span className="block">L'impact de nos solutions pour</span>
            <span className="block">les courtiers en énergie</span>
          </h2>
          
          <p className="max-w-3xl mx-auto text-xl text-white text-opacity-80">
            Des résultats concrets qui transforment la manière dont les professionnels de l'énergie communiquent avec leurs clients.
          </p>
        </div>
        
        {/* Statistiques en grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Stat 1 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:bg-opacity-15 hover:transform hover:scale-105 animate-on-scroll" 
               data-animation="fade-up" style={{ boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1" data-counter="3500">3 500+</div>
              <div className="text-lg text-white text-opacity-80">Courtiers équipés</div>
              <div className="mt-4 text-sm text-white text-opacity-60">À travers toute l'Europe</div>
            </div>
          </div>
          
          {/* Stat 2 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:bg-opacity-15 hover:transform hover:scale-105 animate-on-scroll" 
               data-animation="fade-up" style={{ animationDelay: '0.2s', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1" data-counter="68">68%</div>
              <div className="text-lg text-white text-opacity-80">Gain de temps</div>
              <div className="mt-4 text-sm text-white text-opacity-60">Par rapport aux méthodes traditionnelles</div>
            </div>
          </div>
          
          {/* Stat 3 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:bg-opacity-15 hover:transform hover:scale-105 animate-on-scroll" 
               data-animation="fade-up" style={{ animationDelay: '0.4s', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1" data-counter="42">+42%</div>
              <div className="text-lg text-white text-opacity-80">Taux de conversion</div>
              <div className="mt-4 text-sm text-white text-opacity-60">Augmentation moyenne observée</div>
            </div>
          </div>
          
          {/* Stat 4 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:bg-opacity-15 hover:transform hover:scale-105 animate-on-scroll" 
               data-animation="fade-up" style={{ animationDelay: '0.6s', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1" data-counter="150">150+</div>
              <div className="text-lg text-white text-opacity-80">Templates disponibles</div>
              <div className="mt-4 text-sm text-white text-opacity-60">Avec mises à jour régulières</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
