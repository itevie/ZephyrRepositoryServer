const fs = require("fs");
const express = require("express");
const path = require("path");

// Create app
const app = express();

// Routing
app.get("/package/*/*/download", (req, res) => {
  let parts = req.path.split("/");
  parts.shift();

  let name = parts[1];
  let version = parts[2].toLowerCase();

  // Check if it exists
  if (fs.existsSync(__dirname + "/packages/" + name) == false) {
    console.log("1")
    return res.status(404).send({
      message: `Package ${name} not found in the repository`
    });
  }

  const pkgDir = __dirname + "/packages/" + name;

  // Get the latest version
  if (version == "@latest") {
    let latest = fs.readFileSync(pkgDir + "/latest.txt", "utf-8");
    version = latest;
  }

  // Check the version
  if (fs.existsSync(pkgDir + "/" + version) == false) {
    return res.status(404).send({
      message: `Package version ${version} does not exist in the repository, try the version @latest`
    });
  }

  console.log(`Sending package ${name}@${version} to client`);

  // Send the file
  return res.status(200).sendFile(path.resolve(pkgDir, version, `${name}@${version}.zip`));
});

app.get("/package/*/latest/version", (req, res) => {
  let parts = req.path.split("/");
  parts.shift();

  let name = parts[1];

  // Check if it exists
  if (fs.existsSync(__dirname + "/packages/" + name) == false) {
    console.log("1")
    return res.status(404).send({
      message: `Package ${name} not found in the repository`
    });
  }

  const pkgDir = __dirname + "/packages/" + name;

  // Get the latest version
  let latest = fs.readFileSync(pkgDir + "/latest.txt", "utf-8");

  return res.status(200).send(latest);
})

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});