import React, { useState, useEffect } from 'react';
import { apiLogs, ApiLogViewer } from '../services/api-logger';

/**
 * Composant d'outils de diagnostic pour l'application
 * Fournit une interface pour visualiser les logs API et l'état du système
 */
const DiagnosticTools = ({ isVisible = false }) => {
  const [visible, setVisible] = useState(isVisible);
  const [environment, setEnvironment] = useState({});
  const [logCount, setLogCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Récupérer l'état de l'environnement et des logs périodiquement
  useEffect(() => {
    const updateDiagnosticInfo = () => {
      // Détecter l'environnement
      const env = {
        hostname: window.location.hostname,
        mode: process.env.NODE_ENV,
        demoMode: false, // Force mode production
        isVercel: process.env.REACT_APP_IS_VERCEL === 'true' || 
                  ['vercel.app', 'now.sh'].some(domain => window.location.hostname.includes(domain)),
        apiUrl: process.env.REACT_APP_API_URL || '/api',
        serviceWorker: 'serviceWorker' in navigator && navigator.serviceWorker.controller ? 'actif' : 'inactif',
        timestamp: new Date().toISOString()
      };
      
      setEnvironment(env);
      
      // Compter les logs
      const logs = apiLogs.getLogs();
      setLogCount(logs.length);
    };
    
    // Exécuter immédiatement
    updateDiagnosticInfo();
    
    // Et mettre à jour périodiquement
    const interval = setInterval(updateDiagnosticInfo, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Styles du composant
  const styles = {
    container: {
      position: 'fixed',
      bottom: visible ? '10px' : '-100px',
      right: '10px',
      backgroundColor: 'rgba(33, 33, 33, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 9999,
      transition: 'bottom 0.3s ease-in-out',
      maxWidth: isExpanded ? '600px' : '250px',
      fontFamily: 'monospace',
      fontSize: '12px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5px'
    },
    title: {
      margin: '0',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    button: {
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      padding: '4px 8px',
      borderRadius: '3px',
      cursor: 'pointer',
      marginLeft: '5px',
      fontSize: '11px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '2px 0'
    },
    label: {
      marginRight: '10px',
      fontWeight: 'bold'
    },
    value: {
      color: '#8ecdf8'
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '10px'
    },
    toggleButton: {
      position: 'fixed',
      bottom: '10px',
      right: visible ? '-100px' : '10px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      fontSize: '18px',
      transition: 'right 0.3s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    badge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#f44336',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold'
    }
  };
  
  // Gestionnaires d'événements
  const handleViewLogs = () => {
    ApiLogViewer.open();
  };
  
  const handleClearLogs = () => {
    apiLogs.clearLogs();
    setLogCount(0);
  };
  
  const handleToggleVisibility = () => {
    setVisible(!visible);
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <>
      {/* Bouton flottant pour afficher les outils de diagnostic */}
      <button 
        style={styles.toggleButton} 
        onClick={handleToggleVisibility}
        title="Outils de diagnostic"
      >
        🛠
        {logCount > 0 && <span style={styles.badge}>{logCount}</span>}
      </button>
      
      {/* Panneau d'outils de diagnostic */}
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Diagnostic</h3>
          <div>
            <button style={styles.button} onClick={handleToggleExpand}>
              {isExpanded ? 'Réduire' : 'Étendre'}
            </button>
            <button style={styles.button} onClick={handleToggleVisibility}>
              Fermer
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Host:</span>
              <span style={styles.value}>{environment.hostname}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Mode:</span>
              <span style={styles.value}>{environment.mode}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Demo:</span>
              <span style={styles.value}>{environment.demoMode ? 'Activé' : 'Désactivé'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Vercel:</span>
              <span style={styles.value}>{environment.isVercel ? 'Oui' : 'Non'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>API:</span>
              <span style={styles.value}>{environment.apiUrl}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>SW:</span>
              <span style={styles.value}>{environment.serviceWorker}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Logs:</span>
              <span style={styles.value}>{logCount}</span>
            </div>
          </div>
        )}
        
        <div style={styles.actions}>
          <button style={styles.button} onClick={handleViewLogs}>
            Voir logs ({logCount})
          </button>
          <button style={styles.button} onClick={handleClearLogs}>
            Effacer logs
          </button>
        </div>
      </div>
    </>
  );
};

export default DiagnosticTools;
