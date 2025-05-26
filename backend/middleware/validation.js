/**
 * Middleware de validation des entrées utilisant Joi
 * Assure la sécurité et l'intégrité des données entrantes
 * @module ValidationMiddleware
 */
const Joi = require('joi');
const { logger } = require('../utils/logger');

/**
 * Schéma de validation pour les templates
 */
const templateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  description: Joi.string().max(500).allow('').default('')
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.max': 'La description ne peut pas dépasser {#limit} caractères'
    }),
  user_id: Joi.number().integer().required()
    .messages({
      'number.base': 'L\'ID utilisateur doit être un nombre',
      'number.integer': 'L\'ID utilisateur doit être un entier',
      'any.required': 'L\'ID utilisateur est obligatoire'
    })
});

/**
 * Schéma de validation pour les champs des templates
 */
const fieldSchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(1).max(50).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.pattern.base': 'Le nom ne peut contenir que des lettres, chiffres et underscores',
      'string.min': 'Le nom doit contenir au moins {#limit} caractère',
      'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  label: Joi.string().max(100).allow('').default('')
    .messages({
      'string.base': 'Le libellé doit être une chaîne de caractères',
      'string.max': 'Le libellé ne peut pas dépasser {#limit} caractères'
    }),
  type: Joi.string().valid('text', 'date', 'checkbox', 'image').required()
    .messages({
      'string.base': 'Le type doit être une chaîne de caractères',
      'any.only': 'Le type doit être l\'un des suivants: text, date, checkbox, image',
      'any.required': 'Le type est obligatoire'
    }),
  default_value: Joi.string().allow('').default('')
    .messages({
      'string.base': 'La valeur par défaut doit être une chaîne de caractères'
    }),
  slide_index: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'L\'index de diapositive doit être un nombre',
      'number.integer': 'L\'index de diapositive doit être un entier',
      'number.min': 'L\'index de diapositive doit être un entier positif',
      'any.required': 'L\'index de diapositive est obligatoire'
    }),
  position_x: Joi.number().min(0).required()
    .messages({
      'number.base': 'La position X doit être un nombre',
      'number.min': 'La position X doit être positive',
      'any.required': 'La position X est obligatoire'
    }),
  position_y: Joi.number().min(0).required()
    .messages({
      'number.base': 'La position Y doit être un nombre',
      'number.min': 'La position Y doit être positive',
      'any.required': 'La position Y est obligatoire'
    }),
  width: Joi.number().min(0).allow(null).default(null)
    .messages({
      'number.base': 'La largeur doit être un nombre',
      'number.min': 'La largeur doit être positive'
    }),
  height: Joi.number().min(0).allow(null).default(null)
    .messages({
      'number.base': 'La hauteur doit être un nombre',
      'number.min': 'La hauteur doit être positive'
    })
});

/**
 * Schéma de validation pour la génération de documents
 */
const documentGenerationSchema = Joi.object({
  values: Joi.object().required()
    .messages({
      'object.base': 'Les valeurs doivent être un objet',
      'any.required': 'Les valeurs sont obligatoires'
    }),
  format: Joi.string().valid('pdf', 'pptx').default('pdf')
    .messages({
      'string.base': 'Le format doit être une chaîne de caractères',
      'any.only': 'Le format doit être l\'un des suivants: pdf, pptx'
    })
});

/**
 * Schéma de validation pour l'authentification
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.email': 'L\'email doit être valide',
      'any.required': 'L\'email est obligatoire'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.base': 'Le mot de passe doit être une chaîne de caractères',
      'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
      'any.required': 'Le mot de passe est obligatoire'
    })
});

/**
 * Middleware de validation générique
 * @param {Object} schema - Schéma Joi de validation
 * @returns {Function} Middleware Express
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(x => ({
        field: x.path.join('.'),
        message: x.message
      }));
      
      logger.warn(`Validation failed: ${JSON.stringify(details)}`);
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation des données échouée',
        details
      });
    }
    
    // Remplace le corps de la requête par les données validées
    req.body = value;
    next();
  };
};

module.exports = {
  validateTemplate: validateRequest(templateSchema),
  validateField: validateRequest(fieldSchema),
  validateDocumentGeneration: validateRequest(documentGenerationSchema),
  validateLogin: validateRequest(loginSchema)
};
