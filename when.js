/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require("method")
var when = Method(function(value, onFulfill) {
  return typeof(onFulfill) === "function" ? onFulfill(value) : value
})
when.define(Error, function(error, _, onError) {
  return typeof(onError) === "function" ? onError(error) : error
})

module.exports = when
