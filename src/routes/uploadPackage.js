const express = require("express");
const database = require("../database");
const util = require("../util");

/**
 * 
 * @param {express.Application} app 
 */
module.exports.init = (app) => {
  app.post("/package/*/*/upload", async (req, res) => {
    try {
      const parts = req.path.split("/");
      parts.shift();
    
      // Get package details
      const name = parts[1].toLowerCase();
      const version = parts[2].toLowerCase();

      // Check data
      if (!req.body["data"])
        throw [400, "Missing data in body"];

      // Check logged in
      if (!req.body["username"] || !req.body["password"])
        throw [400, "Missing username or password in body"];
      const username = req.body.username;
      let userID = await database.loginUser(username, req.body.password);

      // Check if package exists
      if (await database.packageExists(name) == false) {
        await database.createPackage(name, parseInt(userID));
      }

      // Upload version
      await database.uploadPackageVersion(name, version, Buffer.from(req.body.data, "hex"));

      return res.status(200).send({
        message: "Version uploaded"
      });
    } catch (err) {
      util.handleError(res, err);
    }
  });
}