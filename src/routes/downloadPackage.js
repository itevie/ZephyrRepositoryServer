const database = require("../database");

module.exports.init = (app) => {
  app.get("/package/*/*/download", async (req, res) => {
    const parts = req.path.split("/");
    parts.shift();
  
    const name = parts[1];
    const version = parts[2].toLowerCase();

    // Check if the package exists
    if (await database.packageExists(name) == false) {
      return res.status(404).send({
        message: `Package ${name} does not exist`
      });
    }

    // Try download
    try {
      const data = await database.retrievePackage(name, version);

      // Send
      res.set("Content-Disposition", 'attachment; filename="download.zip"');
      return res.status(200).send(data);
    } catch (err) {
      if (typeof err == "string") {
        return res.status(400).send({
          message: err
        });
      }

      console.log(err);

      return res.status(500).send({
        message: "Unknown server error"
      });
    }
  });
}