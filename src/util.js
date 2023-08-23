const express = require("express");

/**
 * Handles an error
 * @param {express.Response} res The response
 * @param {any} err The error
 */
module.exports.handleError = (res, err) => {
  if (typeof err == "string") {
    return res.status(400).send({
      message: err
    });
  } else if (Array.isArray(err)) {
    return res.status(err[0]).send({
      message: err[1]
    });
  }

  console.log(err);

  return res.status(500).send({
    message: "Unknown server error"
  });
}