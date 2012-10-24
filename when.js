"use strict";

var Method = require("method")
var when = Method(function(value, onRealize) {
  return typeof(onRealize) === "function" ? onRealize(value) : value
})
when.define(Error, function(error, onRealize, onError) {
  return typeof(onError) === "function" ? onError(error) : error
})

module.exports = when
