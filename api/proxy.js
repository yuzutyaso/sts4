// api/proxy.js
module.exports = (req, res) => {
  const targetUrl = req.query.url; // リクエストのクエリパラメータからターゲットURLを取得

  if (!targetUrl) {
    res.status(400).send('URLパラメータが指定されていません。');
    return;
  }

  // プロキシリクエストを送信
  fetch(targetUrl)
    .then(response => response.text())
    .then(data => {
      res.status(200).send(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('プロキシリクエスト中にエラーが発生しました。');
    });
};
