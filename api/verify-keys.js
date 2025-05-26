// Endpoint sécurisé pour vérifier les clés Supabase
// Route : /api/verify-keys

const express = require('express');
const router = express.Router();
require('dotenv').config();

// Fonction pour masquer partiellement une chaîne (affiche premiers et derniers caractères)
function maskString(str, visibleStart = 8, visibleEnd = 4) {
  if (!str) return 'Non définie';
  if (str.length <= visibleStart + visibleEnd) return str;
  
  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const masked = '*'.repeat(6);
  
  return `${start}...${masked}...${end}`;
}

// Route pour vérifier les clés
router.get('/', (req, res) => {
  try {
    // Récupérer les clés et les masquer partiellement
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
    const jwtSecret = process.env.JWT_SECRET || '';
    
    // Préparation du résultat
    const keyInfo = {
      environment: process.env.NODE_ENV || 'non défini',
      supabase: {
        url: supabaseUrl,
        anonKey: maskString(supabaseAnonKey),
        serviceKey: maskString(supabaseServiceKey),
        // Vérifie si les clés commencent par le format JWT attendu
        anonKeyValid: supabaseAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
        serviceKeyValid: supabaseServiceKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
      },
      auth: {
        jwtSecret: maskString(jwtSecret, 4, 4)
      },
      // Vérifie les valeurs attendues spécifiques
      validation: {
        correctUrlDomain: supabaseUrl.includes('mbwurtmvdgmnrizxfouf'),
        anonKeyEnding: supabaseAnonKey.slice(-10) === 'WIdZvMDs',
        serviceKeyEnding: supabaseServiceKey.slice(-10) === 'p9KIJFsY',
      },
      timestamp: new Date().toISOString()
    };
    
    // Succès global de la vérification
    keyInfo.allKeysValid = 
      keyInfo.supabase.anonKeyValid && 
      keyInfo.supabase.serviceKeyValid && 
      keyInfo.validation.correctUrlDomain;
    
    res.status(200).json({
      success: true,
      message: keyInfo.allKeysValid ? 
        '✅ Les clés Supabase semblent correctes' : 
        '⚠️ Certaines clés pourraient être incorrectes',
      keyInfo
    });
    
  } catch (error) {
    console.error('Erreur de vérification des clés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des clés',
      error: error.message
    });
  }
});

module.exports = router;
