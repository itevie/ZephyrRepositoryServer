const express = require("express");
const database = require("../database");
const util = require("../util");

/**
 * 
 * @param {express.Application} app 
 */
module.exports.init = (app) => {
  app.get("/package/*/details", async (req, res) => {
    let packageName = req.originalUrl.split("/")[2].toLowerCase();

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
      util.handleError(res, err);
    }
  });
}