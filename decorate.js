/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var apply = require("./apply")

// Define a shortcut for `Array.prototype.slice.call`.
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

// Decorator function composes function which can take eventual values as
// arguments, in which case it returns eventual result that is delivered
// result of applying results of eventuals to a decorated `f`. If result is
// delivered in sync delivery value is returned instead.
module.exports = function eventual(f) {
  return function eventually() {
    return apply(f, slice(arguments))
  }
}
