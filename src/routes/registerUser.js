const express = require("express");
const database = require("../database");
const util = require("../util");

/**
 * 
 * @param {express.Application} app 
 */
module.exports.init = (app) => {
  app.post("/users/register", async (req, res) => {
    try {
      // Check body
      if (!req.body["username"])
        throw [400, "Missing username in body"];
      if (!req.body["password"])
        throw [400, "Missing password in body"];

      // Get data
      const username = req.body.username.toLowerCase();
      const password = req.body.password;

      // Check password
      if (!username.match(/^([a-z0-9_]{1,15})$/)) {
        throw [400, `Invalid username, must consist only of 1-15 alphanumeric + _ characters`];
      }

      // Create user
      await database.registerUser(username, password);
      
      // Done
      return res.status(200).send({
        message: `User created successfully`
      });
    } catch (err) {
      util.handleError(res, err);
    }
  });
}