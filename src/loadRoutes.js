const fs = require("fs");

module.exports = (app) => {
  const files = fs.readdirSync(__dirname + "/routes");

  // Loop through files
  files.forEach(routeFile => {
    const route = require(__dirname + "/routes/" + routeFile);
    route.init(app);
    console.log(`Loaded route ${routeFile}`);
  });
}