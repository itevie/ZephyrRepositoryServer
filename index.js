const express = require("express");
const bodyParser = require("body-parser");

// Create app
const app = express();
app.use(bodyParser.json());

// Listen
app.listen(3000, () => {
  require("./src/loadRoutes")(app);
  console.log("Listening on port 3000!");
});