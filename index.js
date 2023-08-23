const fs = require("fs");
const express = require("express");
const path = require("path");

// Create app
const app = express();

// Listen
app.listen(3000, () => {
  require("./src/loadRoutes")(app);
  console.log("Listening on port 3000!");
});