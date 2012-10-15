/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require('method')

// Set's up a callback to be called once pending
// value is realized. All object by default are realized.
module.exports = Method(function(value, callback) {
  callback(value)
})
