import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import TemplateList from './pages/TemplateList';
import TemplateUpload from './pages/TemplateUpload';
import TemplateEditor from './pages/TemplateEditor';
import TemplateFill from './pages/TemplateFill';
import Categories from './pages/Categories';
import ExportHistory from './pages/ExportHistory';

// Définition des couleurs pour l'application - version premium courtier en énergie (inspiré de MonCourtierEnergie.com)
export const ELLY_COLORS = {
  primary: '#002657',      // Bleu marine profond - couleur principale (inspiré de MonCourtierEnergie)
  secondary: '#32BE5B',    // Vert énergie vif - couleur secondaire (inspiré de MonCourtierEnergie)
  tertiary: '#F9FAFC',     // Blanc légèrement bleuté pour backgrounds
  accent: '#FF9F1C',       // Orange énergique pour accents et call-to-actions
  dark: '#001A41',         // Bleu marine très foncé pour texte
  light: '#FFFFFF',        // Blanc pour contrastes
  gray: '#EFF3F9',         // Gris légèrement bleuté pour sections alternatives
  action: '#0081C7',       // Bleu vif pour boutons d'action
  success: '#00C896',      // Vert émeraude pour boutons de confirmation/succès
  warning: '#FF7D00',      // Orange pour boutons d'attention/avertissement
  danger: '#E02424',       // Rouge pour boutons de suppression/danger
  gradient: 'linear-gradient(135deg, #002657 0%, #32BE5B 100%)', // Dégradé bleu-vert comme MonCourtierEnergie
  lightGradient: 'linear-gradient(135deg, rgba(0,38,87,0.03) 0%, rgba(50,190,91,0.03) 100%)', // Dégradé léger pour backgrounds
  gradientLight: 'linear-gradient(135deg, rgba(0,38,87,0.8) 0%, rgba(50,190,91,0.8) 100%)', // Dégradé semi-transparent
  shadowPrimary: '0 10px 15px -3px rgba(0, 38, 87, 0.1), 0 4px 6px -2px rgba(0, 38, 87, 0.05)', // Ombre avec couleur primaire
  shadowSecondary: '0 10px 15px -3px rgba(50, 190, 91, 0.1), 0 4px 6px -2px rgba(50, 190, 91, 0.05)', // Ombre avec couleur secondaire
};

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen font-sans flex flex-col" style={{
            background: ELLY_COLORS.lightGradient,
            color: ELLY_COLORS.dark
          }}>
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                {/* Route d'inscription désactivée */}
                
                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/templates" element={<TemplateList />} />
                  <Route path="/templates/new" element={<TemplateUpload />} />
                  <Route path="/templates/:id/edit" element={<TemplateEditor />} />
                  <Route path="/templates/:id/fill" element={<TemplateFill />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/exports" element={<ExportHistory />} />
                </Route>
              </Routes>
            </main>
            <footer style={{ background: ELLY_COLORS.primary, color: ELLY_COLORS.light }} className="py-6 mt-auto">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="font-semibold text-lg">Elly PPT Manager</p>
                    <p className="text-sm opacity-80">Solution de gestion de modèles PowerPoint</p>
                  </div>
                  <div>
                    <p>&copy; {new Date().getFullYear()} Elly Energie - Tous droits réservés</p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}

export default App;
