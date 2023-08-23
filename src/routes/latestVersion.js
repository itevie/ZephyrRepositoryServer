const express = require("express");
const database = require("../database");

/**
 * 
 * @param {express.Application} app 
 */
module.exports.init = (app) => {
  app.get("/package/*/details", async (req, res) => {
    let packageName = req.originalUrl.split("/")[2];

    // Check if it exists
    if (await database.packageExists(packageName) == false) {
      return res.status(404).send({
        message: `Package ${packageName} does not exist`
      });
    }

    // Fetch details
    try {
      const package = await database.fetchPackage(packageName);

      return res.status(200).send(package);
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