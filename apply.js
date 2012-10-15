/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var when = require("./when")
var group = require("./group")

module.exports = function apply(f/*, params */) {
  return when(group(arguments), function(params) {
    var f = params.shift()
    return f.apply(f, params)
  })
}
