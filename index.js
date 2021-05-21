const express = require("express");
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`The ambitious boys app is listening to ${PORT}`);
});
