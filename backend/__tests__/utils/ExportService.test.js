/**
 * Tests unitaires pour ExportService
 * @module ExportServiceTests
 */
const fs = require('fs');
const path = require('path');
const ExportService = require('../../utils/ExportService');
// Mocks
jest.mock('../../models', () => require('../__mocks__/models'));
const { Export } = require('../../models');

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
  unlinkSync: jest.fn()
}));

describe('ExportService', () => {
  let exportService;
  const mockUserId = 1;
  const mockTemplateId = 2;
  const mockFilePath = '/fake/path/document.pdf';
  const mockFileName = 'document.pdf';
  const mockFormat = 'pdf';
  
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Instancier le service avec les mocks
    exportService = new ExportService();
    
    // Mock pour statSync retournant une taille de fichier
    fs.statSync.mockReturnValue({ size: 1024 });
    
    // Mock pour existsSync
    fs.existsSync.mockReturnValue(true);
  });

  describe('ensureExportDirectory', () => {
    it('devrait créer le répertoire si celui-ci n\'existe pas', async () => {
      // Configurer le mock pour simuler un répertoire inexistant
      fs.existsSync.mockReturnValueOnce(false);
      
      // Appeler la méthode
      const result = await exportService.ensureExportDirectory(mockUserId);
      
      // Vérifier que mkdirSync a été appelé avec les bons arguments
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(mockUserId.toString()), { recursive: true });
      
      // Vérifier que la méthode retourne le chemin correct
      expect(result).toContain(mockUserId.toString());
    });

    it('devrait retourner le chemin existant si le répertoire existe déjà', async () => {
      // Configurer le mock pour simuler un répertoire existant
      fs.existsSync.mockReturnValueOnce(true);
      
      // Appeler la méthode
      const result = await exportService.ensureExportDirectory(mockUserId);
      
      // Vérifier que mkdirSync n'a pas été appelé
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      
      // Vérifier que la méthode retourne le chemin correct
      expect(result).toContain(mockUserId.toString());
    });
  });

  describe('saveExport', () => {
    it('devrait sauvegarder un export en base de données', async () => {
      // Mock pour create retournant un nouvel export
      Export.create.mockResolvedValueOnce({
        id: 1,
        user_id: mockUserId,
        template_id: mockTemplateId,
        file_path: mockFilePath,
        file_name: mockFileName,
        file_size: 1024,
        format: mockFormat
      });
      
      // Appeler la méthode
      await exportService.saveExport(
        mockUserId,
        mockTemplateId,
        mockFilePath,
        mockFileName,
        1024,
        mockFormat
      );
      
      // Vérifier que create a été appelé avec les bons arguments
      expect(Export.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        template_id: mockTemplateId,
        file_path: mockFilePath,
        file_name: mockFileName,
        file_size: 1024,
        format: mockFormat,
        download_count: 0
      });
    });
  });

  describe('deleteExport', () => {
    it('devrait supprimer un export de la base de données et du système de fichiers', async () => {
      // Mock pour findByPk retournant un export existant
      Export.findByPk.mockResolvedValueOnce({
        id: 1,
        file_path: mockFilePath,
        destroy: jest.fn().mockResolvedValueOnce(true)
      });
      
      // Appeler la méthode
      await exportService.deleteExport(1);
      
      // Vérifier que findByPk a été appelé avec l'ID correct
      expect(Export.findByPk).toHaveBeenCalledWith(1);
      
      // Vérifier que unlinkSync a été appelé pour supprimer le fichier
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
      
      // Vérifier que destroy a été appelé pour supprimer l'entrée de la BD
      expect(Export.findByPk.mock.results[0].value.destroy).toHaveBeenCalled();
    });

    it('devrait gérer le cas où l\'export n\'existe pas', async () => {
      // Mock pour findByPk retournant null (export inexistant)
      Export.findByPk.mockResolvedValueOnce(null);
      
      // Vérifier que la méthode rejette la promesse avec une erreur
      await expect(exportService.deleteExport(999)).rejects.toThrow('Export non trouvé');
      
      // Vérifier que unlinkSync n'a pas été appelé
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getFileSize', () => {
    it('devrait retourner la taille d\'un fichier existant', () => {
      // Configurer le mock pour simuler un fichier existant
      fs.existsSync.mockReturnValueOnce(true);
      fs.statSync.mockReturnValueOnce({ size: 2048 });
      
      // Appeler la méthode
      const result = exportService.getFileSize(mockFilePath);
      
      // Vérifier que statSync a été appelé avec le bon chemin
      expect(fs.statSync).toHaveBeenCalledWith(mockFilePath);
      
      // Vérifier que la méthode retourne la bonne taille
      expect(result).toBe(2048);
    });

    it('devrait retourner 0 si le fichier n\'existe pas', () => {
      // Configurer le mock pour simuler un fichier inexistant
      fs.existsSync.mockReturnValueOnce(false);
      
      // Appeler la méthode
      const result = exportService.getFileSize(mockFilePath);
      
      // Vérifier que statSync n'a pas été appelé
      expect(fs.statSync).not.toHaveBeenCalled();
      
      // Vérifier que la méthode retourne 0
      expect(result).toBe(0);
    });
  });
});
