const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Please provide a URL in the query parameter.');
  }

  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    followRedirects: true, // リダイレクトを追跡する
    selfHandleResponse: true,
    onProxyRes: (proxyRes, req, res) => {
      // CORSヘッダーを付与して、ブラウザでの表示を可能にする
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];

      proxyRes.pipe(res);
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      // エラー時に具体的なメッセージを返す
      res.status(500).send(`Proxy Error: ${err.message}`);
    }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
