const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).render("root/index");
});

app.listen(PORT, () => {
  console.log(`The ambitious boys app is listening to ${PORT}`);
});
