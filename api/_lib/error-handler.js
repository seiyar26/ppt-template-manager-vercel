// Gestionnaire d'erreurs pour les APIs Vercel
module.exports = {
    handleApiError: (error, res, defaultMessage = 'Erreur interne du serveur') => {
        console.error('Erreur API:', error);

        // Si la réponse a déjà été envoyée, ne pas tenter de l'envoyer à nouveau
        if (res.headersSent) {
            return;
        }

        // Déterminer le code de statut et le message d'erreur
        let statusCode = 500;
        let message = defaultMessage;

        if (error.response) {
            // Erreur de requête HTTP
            statusCode = error.response.status || 500;
            message = error.response.data?.message || error.message || defaultMessage;
        } else if (error.code) {
            // Erreur avec code spécifique
            switch (error.code) {
                case 'ENOTFOUND':
                    statusCode = 404;
                    message = 'Ressource non trouvée';
                    break;
                case 'ECONNREFUSED':
                    statusCode = 503;
                    message = 'Service indisponible';
                    break;
                default:
                    message = error.message || defaultMessage;
            }
        } else if (error.message) {
            message = error.message;
        }

        return res.status(statusCode).json({
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};
