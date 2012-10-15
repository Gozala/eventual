/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var watchers = require("watchable/watchers")
var watch = require("watchable/watch")
var await = require("../pending/await")
var isPending = require("../pending/is")
var deliver = require("../pending/deliver")
var when = require("./when")

var observers = "observers@" + module.id
var delivered = "value@" + module.id
var pending = "pending@" + module.id

var isError = (function() {
  var stringy = Object.prototype.toString
  var error = stringy.call(Error.prototype)
  return function isError(value) {
    return stringy.call(value) === error
  }
})()
function identity(value) { return value }
function attempt(f) {
  return function effort(value) {
    try { return f(value) }
    catch (error) { return error }
  }
}

function Eventual() {
  // Data type representing pending value, that eventually will be delivered.
  // It can be watched to observe delivery.
  this[observers] = []
  this[delivered] = this
  this[pending] = true
}
Eventual.observers = observers
Eventual.delivered = delivered
Eventual.pending = pending

isPending.define(Eventual, function(eventual) {
  return eventual[pending]
})
watchers.define(Eventual, function(eventual) {
  return eventual[observers]
})
deliver.define(Eventual, function(eventual, value) {
  // TODO: Attempt to deliver as side effect of
  // dispatch will change a value 
  if (isPending(eventual)) {
    eventual[delivered] = value
    var observer = eventual[observers]
    eventual[observers] = []
    if (typeof(observer) === "function") {
      await(value, observer)
    } else {
      var index = 0, count = observer.length
      while (index < count) {
        await(value, observer[index])
        index = index + 1
      }
    }
    if (eventual[observers].length)
      deliver(eventual, value)
    else
      eventual[pending] = false
  }
  return value
})

await.define(Eventual, function(eventual, observer) {
  if (isPending(eventual)) watch(eventual, observer)
  else observer(eventual[delivered])
})

when.define(Eventual, function(value, onFulfill, onError) {
  var eventual = new Eventual()
  onFulfill = onFulfill ? attempt(onFulfill) : identity
  onError = onError ? attempt(onError) : identity
  await(value, function delivered(value) {
    // Override `eventual` so that outer `when` will return present
    // result instead of eventual one if `value` is already present.
    eventual = isError(value) ? deliver(eventual, onError(value))
                              : deliver(eventual, onFulfill(value))
  })
  return eventual
})

module.exports = Eventual
