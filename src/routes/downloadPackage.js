const express = require("express");
const database = require("../database");
const util = require("../util");

/**
 * 
 * @param {express.Application} app 
 */
module.exports.init = (app) => {
  app.get("/package/*/*/download", async (req, res) => {
    const parts = req.path.split("/");
    parts.shift();
  
    const name = parts[1].toLowerCase();
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
      util.handleError(res, err);
    }
  });
}