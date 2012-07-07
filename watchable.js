/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require('method')

// Module defines protocol of `values` that can be watched. In order to support
// this protocol one just needs to implement `watchers` method.
var watchers = Method()
exports.watchers = watchers

// Registers a `value` `watcher` function unless it already watches it.
var watch = Method(function(value, watcher) {
  var listeners = watchers(value)
  if (listeners && listeners.indexOf(watcher) < 0)
    listeners.push(watcher)
  return value
})
exports.watch = watch

// Unregisters a `value` `watcher` function if it's being watched.
var unwatch = Method(function(value, watcher) {
  var listeners = watchers(value)
  var index = listeners && listeners.indexOf(watcher)
  if (listeners && listeners.indexOf(watcher) >= 0)
    listeners.splice(index, 1)
  return value
})
exports.unwatch = unwatch
