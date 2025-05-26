/**
 * Tests unitaires pour le middleware de validation
 * @module ValidationMiddlewareTests
 */
const {
  validateTemplate,
  validateField,
  validateDocumentGeneration,
  validateLogin
} = require('../../middleware/validation');
const { logger } = require('../../utils/logger');

// Mock le logger pour éviter les logs pendant les tests
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn()
  }
}));

describe('Middleware de validation', () => {
  let req, res, next;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Préparer les objets mockés pour express
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('validateTemplate', () => {
    it('devrait valider un template valide', () => {
      // Préparer les données de test
      req.body = {
        name: 'Template Test',
        description: 'Description de test',
        user_id: 1
      };
      
      // Appeler le middleware
      validateTemplate(req, res, next);
      
      // Vérifier que next() a été appelé sans erreur
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait rejeter un template avec nom trop court', () => {
      // Préparer les données de test
      req.body = {
        name: 'Te',  // Trop court (< 3 caractères)
        description: 'Description de test',
        user_id: 1
      };
      
      // Appeler le middleware
      validateTemplate(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Validation des données échouée'
      }));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('devrait rejeter un template sans user_id', () => {
      // Préparer les données de test
      req.body = {
        name: 'Template Test',
        description: 'Description de test'
        // user_id manquant
      };
      
      // Appeler le middleware
      validateTemplate(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'user_id'
          })
        ])
      }));
    });
  });

  describe('validateField', () => {
    it('devrait valider un champ valide', () => {
      // Préparer les données de test
      req.body = {
        name: 'field_name',
        label: 'Field Label',
        type: 'text',
        default_value: '',
        slide_index: 0,
        position_x: 10,
        position_y: 20,
        width: 100,
        height: 50
      };
      
      // Appeler le middleware
      validateField(req, res, next);
      
      // Vérifier que next() a été appelé sans erreur
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait rejeter un champ avec type invalide', () => {
      // Préparer les données de test
      req.body = {
        name: 'field_name',
        label: 'Field Label',
        type: 'invalid_type',  // Type non supporté
        default_value: '',
        slide_index: 0,
        position_x: 10,
        position_y: 20
      };
      
      // Appeler le middleware
      validateField(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'type'
          })
        ])
      }));
    });

    it('devrait rejeter un champ avec nom contenant des caractères spéciaux', () => {
      // Préparer les données de test
      req.body = {
        name: 'field-name$',  // Contient des caractères spéciaux
        label: 'Field Label',
        type: 'text',
        default_value: '',
        slide_index: 0,
        position_x: 10,
        position_y: 20
      };
      
      // Appeler le middleware
      validateField(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name'
          })
        ])
      }));
    });
  });

  describe('validateDocumentGeneration', () => {
    it('devrait valider une requête de génération valide', () => {
      // Préparer les données de test
      req.body = {
        values: {
          field1: 'value1',
          field2: 'value2'
        },
        format: 'pdf'
      };
      
      // Appeler le middleware
      validateDocumentGeneration(req, res, next);
      
      // Vérifier que next() a été appelé sans erreur
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait utiliser pdf comme format par défaut si non spécifié', () => {
      // Préparer les données de test
      req.body = {
        values: {
          field1: 'value1'
        }
        // format non spécifié
      };
      
      // Appeler le middleware
      validateDocumentGeneration(req, res, next);
      
      // Vérifier que next() a été appelé sans erreur et que format a été défini par défaut
      expect(next).toHaveBeenCalled();
      expect(req.body.format).toBe('pdf');
    });

    it('devrait rejeter une requête sans valeurs', () => {
      // Préparer les données de test
      req.body = {
        format: 'pdf'
        // values manquant
      };
      
      // Appeler le middleware
      validateDocumentGeneration(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait rejeter une requête avec format invalide', () => {
      // Préparer les données de test
      req.body = {
        values: {
          field1: 'value1'
        },
        format: 'doc'  // Format non supporté
      };
      
      // Appeler le middleware
      validateDocumentGeneration(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'format'
          })
        ])
      }));
    });
  });

  describe('validateLogin', () => {
    it('devrait valider des identifiants valides', () => {
      // Préparer les données de test
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };
      
      // Appeler le middleware
      validateLogin(req, res, next);
      
      // Vérifier que next() a été appelé sans erreur
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait rejeter un email invalide', () => {
      // Préparer les données de test
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      // Appeler le middleware
      validateLogin(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email'
          })
        ])
      }));
    });

    it('devrait rejeter un mot de passe trop court', () => {
      // Préparer les données de test
      req.body = {
        email: 'user@example.com',
        password: '12345'  // Trop court (< 6 caractères)
      };
      
      // Appeler le middleware
      validateLogin(req, res, next);
      
      // Vérifier que la validation a échoué
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'password'
          })
        ])
      }));
    });
  });
});
