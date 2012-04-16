/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var protocol = require('protocol/core').protocol
var reflection = require('reflection/core'),
    string = reflection.string, array = reflection.array,
    object = reflection.object, fn = reflection.fn

function attempt(f) {
  /**
  Returns wrapper function that delegates to `f`. If `f` throws then captures
  error and returns promise that rejects with a thrown error. Otherwise returns
  return value. (Internal utility)
  **/
  return function effort(options) {
    try { return f(options) }
    catch(error) { return error }
  }
}

var IEventual = protocol({
  deliver: [ protocol, 'value' ]
})
exports.IEventual = IEventual
exports.deliver = IEventual.deliver


var IReactor = protocol({
  wait: [ protocol, 'deliver:Function', 'reject:Function' ],
})
exports.IReactor = IReactor

var wait = IReactor.wait
exports.wait = wait

IReactor(Object, {
  wait: function(reactor, deliver, reject) {
    return attempt(deliver)(reactor)
  }
})

IReactor(Error, {
  wait: function(reactor, deliver, reject) {
    return attempt(reject)(reactor)
  }
})

function valueOf(object) { return object.valueOf(valueOf) }
function identity(value) { return value }

function Reactor() {
  var state = { pending: [] }
  return Object.create(Reactor.prototype, {
    valueOf: { value: function($) {
      return $ === valueOf ? state : this
    }}
  })
}
exports.Reactor = Reactor
IEventual(Reactor, {
  deliver: function deliver(reactor, value) {
    var state = valueOf(reactor), pending = state.pending
    if (pending) {
      state.result = value
      while (pending.length) wait.apply(null, [value].concat(pending.shift()))
      state.pending = false
    }
  }
})
IReactor(Reactor, {
  wait: function(reactor, deliver, reject) {
    var state = valueOf(reactor), pending = state.pending, result = state.result
    if (!pending) return wait(result, deliver, reject)
    result = Reactor()
    deliver = deliver ? attempt(deliver) : identity
    reject = reject ? attempt(reject) : identity
    pending.push([
      function delivered(value) { IEventual.deliver(result, deliver(value)) },
      function rejected(error) { IEventual.deliver(result, reject(error)) }
    ])
    return result
  }
})

function eventual(f) {
  return function() {
    var result = array.reduce(arguments, function(items, item) {
      return wait(item, function(value) {
        return wait(items, function(values) {
          return array.concat([ value ], values)
        })
      })
    }, [])
    return wait(result, function(args) {
      return f.apply(f, args);
    })
  }
}
exports.eventual = eventual

