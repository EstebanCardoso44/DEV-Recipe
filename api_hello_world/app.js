const express = require('express');
const app = express();
const port = 2000;

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
