/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var when = require('./when')
module.exports = function(eventual, f) {
  return when(eventual, null, f)
}
