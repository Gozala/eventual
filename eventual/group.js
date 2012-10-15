/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var when = require("./when")
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

module.exports = function group(eventuals) {
  return slice(eventuals).reduce(function(eventuals, eventual) {
    return when(eventual, function(value) {
      return when(eventuals, function(values) {
        values.push(value)
        return values
      })
    })
  }, [])
}
