/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require('method')
var Name = require('name')

var $ = require('./watchable'),
    watch = $.watch, watchers = $.watchers

// Define a shortcut for `Array.prototype.slice.call`.
var unbind = Function.call.bind(Function.bind, Function.call)
var stringify = unbind(Object.prototype.toString)

function type(value) {
  var string = stringify(value)
  var name = string.substring('[object '.length, string.length - 1)
  return name[0].toLowerCase() + name.substr(1)
}

function isError(value) {
  return type(value) === 'error'
}

// Returns `true` if given `value` is pending, otherwise returns
// `false`. All types will return false unless type specific
// implementation is provided to do it otherwise.
var isPending = Method(function() { return false })
exports.isPending = isPending

// Set's up a callback to be called once pending
// value is realized. All object by default are realized.
var await = Method(function(value, callback) {
  if (isPending(value))
    watch(value, callback)
  else
    callback(value)
})
exports.await = await

function when(value, onFulfill, onError) {
  var deferred = defer()
  await(value, function(result) {
    if (isError(result)) deliver(deferred, onError(result))
    else deliver(deferred, onFulfill(result))
  })
  return deferred
}
exports.when = when

// Fulfills deferred value.
var deliver = Method()
exports.deliver = deliver

// Returns array of registered observers.
var observers = Name()
// internal boolean property indicating weather value
// is realized or not.
var pending = Name()
// Returns value if it's realized.
var valueOf = Name()

// Type representing eventual values.
function Eventual() {
  // Set initial values.
  this[observers] = []
  this[pending] = true
  this[valueOf] = null
}
watchers.define(Eventual, function(value) {
  return value[observers]
})
isPending.define(Eventual, function(value) {
  return value[pending]
})
deliver.define(Eventual, function(value, result) {
  // TODO: Attempt to deliver as side effect of
  // dispatch will change a value 
  if (isPending(value)) {
    value[valueOf] = result
    var listeners = watchers(value)
    while (listeners.length)
      await(result, listeners.shift())
    value[pending] = false
  }

  return value
})
exports.Eventual = Eventual


function defer() {
  return new Eventual()
}
exports.defer = defer
