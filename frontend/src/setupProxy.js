const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('Configuration du proxy pour rediriger les requêtes API vers http://localhost:4444');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4444',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'  // Garde le préfixe /api lors de la redirection
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxy: ${req.method} ${req.url} -> http://localhost:4444${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('Erreur de proxy:', err);
      }
    })
  );
};
