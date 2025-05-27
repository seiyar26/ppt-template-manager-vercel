/**
 * API Route Vercel - Génération de documents à partir d'un template
 * 
 * Cette route permet de générer un document PDF ou PowerPoint
 * à partir d'un template et des valeurs des champs fournies.
 */

const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { supabaseAdmin } = require('../../_lib/supabase-client');

// Configuration pour stocker les fichiers générés
const STORAGE_BUCKET = 'ppt-templates';
const EXPORTS_FOLDER = 'exports';

export default async function handler(req, res) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Seulement accepter les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Méthode ${req.method} non supportée`
    });
  }

  // Récupérer l'ID du template depuis l'URL
  const { id: templateId } = req.query;

  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: 'ID du template requis'
    });
  }

  try {
    console.log(`Génération de document pour le template ${templateId}`);
    
    // Récupérer les données du body
    const { values, format = 'pptx', documentName } = req.body;
    
    if (!values) {
      return res.status(400).json({
        success: false,
        error: 'Valeurs des champs requises'
      });
    }
    
    if (!['pptx', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Format non supporté. Formats disponibles: pptx, pdf'
      });
    }
    
    // Récupérer les informations du template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('ppt_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (templateError) {
      console.error('Erreur lors de la récupération du template:', templateError);
      throw new Error(`Template introuvable: ${templateError.message}`);
    }
    
    // Récupérer les champs du template
    const { data: fields, error: fieldsError } = await supabaseAdmin
      .from('ppt_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('slide_index', { ascending: true });
    
    if (fieldsError) {
      console.error('Erreur lors de la récupération des champs:', fieldsError);
      throw new Error(`Champs introuvables: ${fieldsError.message}`);
    }
    
    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    let fileName, fileBuffer, contentType;
    
    if (format === 'pdf') {
      // Générer un véritable PDF avec pdf-lib
      fileName = `document_${timestamp}.pdf`;
      
      try {
        // Créer un nouveau document PDF
        const pdfDoc = await PDFDocument.create();
        
        // Ajouter une page
        const page = pdfDoc.addPage([595.28, 841.89]); // Format A4
        const { width, height } = page.getSize();
        
        // Charger les polices standard
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Ajouter un titre
        const title = documentName || template.name || 'Document généré';
        page.drawText(title, {
          x: 50,
          y: height - 50,
          size: 24,
          font: helveticaBold,
          color: rgb(0, 0, 0)
        });
        
        // Ajouter la date
        const dateStr = new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        page.drawText(`Généré le ${dateStr}`, {
          x: 50,
          y: height - 80,
          size: 12,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        // Dessiner une ligne de séparation
        page.drawLine({
          start: { x: 50, y: height - 100 },
          end: { x: width - 50, y: height - 100 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        // Afficher les champs et leurs valeurs
        let yPosition = height - 150;
        
        for (const field of fields) {
          // Récupérer la valeur du champ
          const fieldValue = values[field.name] || field.default_value || '';
          const fieldLabel = field.label || field.name;
          
          // Afficher le label du champ
          page.drawText(`${fieldLabel}:`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: helveticaBold,
            color: rgb(0, 0, 0)
          });
          
          // Afficher la valeur du champ
          page.drawText(fieldValue, {
            x: 200,
            y: yPosition,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0)
          });
          
          // Décaler la position Y pour le prochain champ
          yPosition -= 30;
          
          // Si on atteint le bas de la page, créer une nouvelle page
          if (yPosition < 50) {
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - 50;
          }
        }
        
        // Ajouter un pied de page
        page.drawText('Document généré par PowerPoint Template Manager', {
          x: 50,
          y: 30,
          size: 10,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        // Sérialiser le PDF en Buffer
        fileBuffer = await pdfDoc.save();
        contentType = 'application/pdf';
        
      } catch (pdfError) {
        console.error('Erreur lors de la génération du PDF:', pdfError);
        throw new Error(`Erreur PDF: ${pdfError.message}`);
      }
    } else {
      // Pour le format PPTX, générer un fichier texte temporairement
      fileName = `document_${timestamp}.txt`;
      const fileContent = `Document de démonstration\n\nTemplate: ${template.name}\nFormat demandé: ${format}\nDate: ${new Date().toISOString()}\n\nValeurs soumises: ${JSON.stringify(values, null, 2)}\n\n--- Génération PPTX à implémenter ---`;
      fileBuffer = Buffer.from(fileContent);
      contentType = 'text/plain;charset=UTF-8';
    }
    
    // Créer le chemin complet du fichier
    const filePath = `${EXPORTS_FOLDER}/${uniqueId}/${fileName}`;
    
    // Stocker le fichier dans Supabase
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      throw new Error(`Erreur de stockage: ${uploadError.message}`);
    }
    
    // Obtenir l'URL publique
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL publique du fichier');
    }
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('URL publique générée:', publicUrl);
    
    // Répondre avec succès
    return res.status(200).json({
      success: true,
      message: 'Document généré avec succès',
      filePath,
      fileUrl: publicUrl
    });
    
  } catch (error) {
    console.error('Erreur génération document:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du document',
      details: error.message || 'Erreur inconnue'
    });
  }
}
