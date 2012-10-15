/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require('method')
var watchers = require('./watchers')

module.exports = Method(function(value, watcher) {
  // Unregisters a `value` `watcher` if it's being registered.
  var registered = watchers(value)
  var index = registered && registered.indexOf(watcher)
  if (index >= 0) registered.splice(index, 1)
  return value
})
