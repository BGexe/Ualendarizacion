const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/send-email',
    createProxyMiddleware({
      target: 'https://ualendarizacion-production.up.railway.app/',
      changeOrigin: true,
      secure: false,
    })
  );
};