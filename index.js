const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// `public`フォルダ内の静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

// プロキシエンドポイント
app.get('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Please provide a URL in the query parameter.');
  }

  // プロキシミドルウェアの作成と実行
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    selfHandleResponse: true, // レスポンスを自分で処理
    onProxyRes: (proxyRes, req, res) => {
      // Content-Security-Policy (CSP)ヘッダーを削除または変更することで、
      // 外部リソースの読み込みを許可する可能性があるが、セキュリティリスクがあるため注意
      delete proxyRes.headers['content-security-policy'];
      
      // レスポンスをそのままクライアントに送信
      proxyRes.pipe(res);
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).send('Proxy Error');
    }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
