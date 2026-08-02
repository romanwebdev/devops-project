const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

app.get('/', (req, res) => {
  res.send('Hello from DevOps Project!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
