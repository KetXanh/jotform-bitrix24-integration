require("dotenv").config();

const express = require("express");

const jotformRoute = require("./src/routes/jotform.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(jotformRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
