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

function identity(value) { return value }
function attempt(f) {
  return function effort(value) {
    try { return f(value) }
    catch (error) { return error }
  }
}

// Returns `true` if given `value` is pending, otherwise returns
// `false`. All types will return false unless type specific
// implementation is provided to do it otherwise.
var isPending = Method(function() { return false })
exports.isPending = isPending

// Set's up a callback to be called once pending
// value is realized. All object by default are realized.
var await = Method(function(value, callback) {
  callback(value)
})
exports.await = await

// Wait for a given value to resolve, then execute a callback.
//
// If the given value is an error object, calls the `onError` callback
// (if any). Otherwise, calls the `onFulfill` callback.
// 
// If the value passed is not an `Eventual`, `when` will execute the
// appropriate callback immediately.
// 
// Returns an `Eventual` object.
function when(value, onFulfill, onError) {
  var deferred = defer()
  onFulfill = onFulfill ? attempt(onFulfill) : identity
  onError = onError ? attempt(onError) : identity
  await(value, function(result) {
    // Override `deferred` so that outer `when` will return present
    // result instead of deferred one if `value` is already present.
    deferred = isError(result) ? deliver(deferred, onError(result))
                               : deliver(deferred, onFulfill(result))
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

// Define a constructor for type representing eventual values.
function Eventual() {
  // Set initial values.
  this[observers] = []
  this[pending] = true
  this[valueOf] = null
}
await.define(Eventual, function(value, callback) {
  if (isPending(value))
    watch(value, callback)
  else
    callback(value[valueOf])
})

// Implement `watchers` method for objects created with `Eventual` constructor.
// Returns the array of observing functions.
watchers.define(Eventual, function(value) {
  return value[observers]
})

// Implement `isPending` method for `Eventual` objects.
// Check if an eventual value is pending resolution.
// Returns a boolean.
isPending.define(Eventual, function(value) {
  return value[pending]
})

// Implement `deliver` method for objects created with `Eventual` constructor.
// Returns the value you pass as the resolution value.
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

  return result
})
exports.Eventual = Eventual

// Define a factory function for `Eventual`.
// Allows you to treat Eventual construction as just another function.
// Keeps you from having to type `new`.
// Returns a new `Eventual` object.
function defer() {
  return new Eventual()
}
exports.defer = defer
