/**
 * Tests unitaires pour PowerPointService
 * @module PowerPointServiceTests
 */
const fs = require('fs');
const path = require('path');
const PowerPointService = require('../../utils/PowerPointService');
const PptxGenJS = require('pptxgenjs');

// Mocks
jest.mock('pptxgenjs');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

describe('PowerPointService', () => {
  let powerPointService;
  let mockPptx;
  
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Mock de l'instance PptxGenJS
    mockPptx = {
      defineLayout: jest.fn(),
      layout: jest.fn(),
      addSlide: jest.fn(),
      writeFile: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // Mock du constructeur PptxGenJS
    PptxGenJS.mockImplementation(() => mockPptx);
    
    // Mock des slides
    mockPptx.addSlide.mockImplementation(() => ({
      background: jest.fn(),
      addText: jest.fn(),
      addImage: jest.fn(),
      addShape: jest.fn()
    }));
    
    // Mock des opérations de fichier
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));
    
    // Instancier le service avec les mocks
    powerPointService = new PowerPointService();
  });

  describe('generatePowerPoint', () => {
    it('devrait générer un fichier PowerPoint correctement', async () => {
      // Données de test
      const slides = [
        { id: 1, background_image: 'bg1.jpg', template_id: 1 },
        { id: 2, background_image: 'bg2.jpg', template_id: 1 }
      ];
      
      const fields = [
        { id: 1, name: 'title', type: 'text', slide_index: 0, position_x: 10, position_y: 20, width: 100, height: 50 },
        { id: 2, name: 'checkbox1', type: 'checkbox', slide_index: 1, position_x: 30, position_y: 40, width: 20, height: 20 },
        { id: 3, name: 'image1', type: 'image', slide_index: 1, position_x: 50, position_y: 60, width: 200, height: 150 }
      ];
      
      const values = {
        title: 'Test Presentation',
        checkbox1: true,
        image1: 'data:image/jpeg;base64,/9j/fake-base64-data' // Données d'image encodées en base64
      };
      
      const outputPath = '/test/output/presentation.pptx';
      
      // Appeler la méthode
      await powerPointService.generatePowerPoint(slides, fields, values, outputPath);
      
      // Vérifications
      expect(PptxGenJS).toHaveBeenCalled();
      expect(mockPptx.defineLayout).toHaveBeenCalled();
      expect(mockPptx.layout).toHaveBeenCalled();
      
      // Vérifier que les slides ont été ajoutés
      expect(mockPptx.addSlide).toHaveBeenCalledTimes(2);
      
      // Vérifier que le fichier a été écrit
      expect(mockPptx.writeFile).toHaveBeenCalledWith(expect.stringContaining(outputPath));
    });
    
    it('devrait gérer une erreur lors de la génération', async () => {
      // Configurer le mock pour simuler une erreur
      mockPptx.writeFile.mockRejectedValueOnce(new Error('Erreur de génération'));
      
      // Données de test
      const slides = [{ id: 1, background_image: 'bg.jpg', template_id: 1 }];
      const fields = [{ id: 1, name: 'title', type: 'text', slide_index: 0, position_x: 10, position_y: 20 }];
      const values = { title: 'Test' };
      const outputPath = '/test/output/presentation.pptx';
      
      // Vérifier que la méthode rejette la promesse avec l'erreur
      await expect(powerPointService.generatePowerPoint(slides, fields, values, outputPath))
        .rejects.toThrow('Erreur lors de la génération du PowerPoint');
    });
  });

  describe('addTextField', () => {
    it('devrait ajouter correctement un champ texte', () => {
      // Préparer les mocks
      const mockSlide = {
        addText: jest.fn()
      };
      
      const field = {
        name: 'title',
        position_x: 10,
        position_y: 20,
        width: 100,
        height: 50
      };
      
      const value = 'Test Title';
      
      // Appeler la méthode
      powerPointService.addTextField(mockSlide, field, value);
      
      // Vérifier que addText a été appelé avec les bons arguments
      expect(mockSlide.addText).toHaveBeenCalledWith(
        value,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number)
        })
      );
    });
  });
  
  describe('addCheckboxField', () => {
    it('devrait ajouter correctement une case à cocher cochée', () => {
      // Préparer les mocks
      const mockSlide = {
        addShape: jest.fn()
      };
      
      const field = {
        name: 'checkbox1',
        position_x: 30,
        position_y: 40,
        width: 20,
        height: 20
      };
      
      const value = true;
      
      // Appeler la méthode
      powerPointService.addCheckboxField(mockSlide, field, value);
      
      // Vérifier que addShape a été appelé pour une case cochée
      expect(mockSlide.addShape).toHaveBeenCalledWith(
        expect.stringContaining('CHECK'),
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number),
          fill: expect.any(Object)
        })
      );
    });
    
    it('devrait ajouter correctement une case à cocher non cochée', () => {
      // Préparer les mocks
      const mockSlide = {
        addShape: jest.fn()
      };
      
      const field = {
        name: 'checkbox1',
        position_x: 30,
        position_y: 40,
        width: 20,
        height: 20
      };
      
      const value = false;
      
      // Appeler la méthode
      powerPointService.addCheckboxField(mockSlide, field, value);
      
      // Vérifier que addShape a été appelé pour une case non cochée
      expect(mockSlide.addShape).toHaveBeenCalledWith(
        expect.stringContaining('ROUNDED_RECTANGLE'),
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number),
          fill: expect.any(Object)
        })
      );
    });
  });
  
  describe('addImageField', () => {
    it('devrait ajouter correctement une image depuis une URL base64', () => {
      // Préparer les mocks
      const mockSlide = {
        addImage: jest.fn()
      };
      
      const field = {
        name: 'image1',
        position_x: 50,
        position_y: 60,
        width: 200,
        height: 150
      };
      
      const value = 'data:image/jpeg;base64,/9j/fake-base64-data';
      
      // Appeler la méthode
      powerPointService.addImageField(mockSlide, field, value);
      
      // Vérifier que addImage a été appelé avec les bons arguments
      expect(mockSlide.addImage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(String),
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number)
        })
      );
    });
  });
  
  describe('convertCoordinates', () => {
    it('devrait convertir correctement les coordonnées pixel en pouces', () => {
      // Définir les coordonnées en pixels
      const pixelX = 100;
      const pixelY = 200;
      
      // Résolution par défaut (96 DPI)
      const expectedX = pixelX / 96;
      const expectedY = pixelY / 96;
      
      // Appeler la méthode
      const { x, y } = powerPointService.convertCoordinates(pixelX, pixelY);
      
      // Vérifier les résultats
      expect(x).toBe(expectedX);
      expect(y).toBe(expectedY);
    });
  });
});
