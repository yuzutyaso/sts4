const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;

  // 1. プロキシリクエストが来たことをログ出力
  console.log(`[Proxy] Incoming request for: ${targetUrl}`);
  
  if (!targetUrl) {
    // URLがない場合はエラーをログ出力
    console.error('[Proxy] Error: URL query parameter is missing.');
    return res.status(400).send('Please provide a URL in the query parameter.');
  }

  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    followRedirects: true,
    selfHandleResponse: true,
    
    // 2. プロキシ先へのリクエスト時にログ出力
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] Sending request to: ${proxyReq.path}`);
    },

    onProxyRes: (proxyRes, req, res) => {
      // CORSヘッダーを付与して、ブラウザでの表示を可能にする
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];

      // ステータスコードをログ出力
      console.log(`[Proxy] Received response with status: ${proxyRes.statusCode}`);
      proxyRes.pipe(res);
    },

    // 3. エラー発生時に詳細なログ出力
    onError: (err, req, res) => {
      console.error(`[Proxy] An error occurred: ${err.message}`);
      console.error(err); // スタックトレースを含む詳細なログを出力
      res.status(500).send(`Proxy Error: ${err.message}`);
    }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
