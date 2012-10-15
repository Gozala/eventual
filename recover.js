/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var when = require("./when")

// Utility function allows one to recover from an error if eventual value
// happen to be delivered it. Result is an eventual that is either equivalent 
// of given eventual or return value of the recovery function that is invoked
// with delivered error.
module.exports = function recover(eventual, f) {
  return when(eventual, null, f)
}
