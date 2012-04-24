/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var protocol = require('protocol/core').protocol
var reflection = require('reflection/core'),
    string = reflection.string, array = reflection.array,
    object = reflection.object, fn = reflection.fn
var nil

function identity(value) { return value }
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

var ISecure = protocol({
  privates: [ protocol, 'accessor' ]
})
exports.ISecure = ISecure
var privates = ISecure.privates

var IPending = protocol({
  isRealized: [ protocol ]
})
var isRealized = IPending.isRealized

var IValue = protocol({
  valueOf: [ protocol ]
})
exports.IValue = IValue
var valueOf = IValue.valueOf

var IDeferred = protocol({
  realize: [ protocol, 'value' ]
})
exports.IDeferred = IDeferred

var IEventual = protocol({
  then: [ protocol, 'realized:Function', 'rejected:Function' ],
  when: [ protocol, 'realized:Function', 'rejected:Function' ]
})
exports.IEventual = IEventual
var then = IEventual.then, when = IEventual.when

IValue(Object, {
  value: function($) {
    return $.valueOf()
  }
})
IEventual(Object, {
  then: function(object, realized, rejected) {
    var deferred = defer()
    realized = attempt(realized || identity)
    rejected = attempt(rejected || identity)
    when(object, function($) {
      realize(deferred, realized($))
    }, function($) {
      realize(deferred, rejected($))
    })
    return valueOf(deferred)
  },
  when: function(object, realize, _) {
    realize(object)
  }
})

IEventual(Error, {
  when: function($, _, rejected) { attempt(rejected)($) }
})

var DeferredKey = {}
function Deferred(state, observers) {
  var privates = { state: state, observers: observers }
  return Object.defineProperties(this, {
    valueOf: { value: function(key) {
      return key === DeferredKey ? privates : this
    }}
  })
}
exports.Deferred = Deferred
ISecure(Deferred, {
  privates: function($) { return $.valueOf(DeferredKey) }
})
IPending(Deferred, {
  isRealized: function($) { return privates($).state.done }
})
IValue(Deferred, {
  valueOf: function($) { return isRealized($) ? privates($).state.value : $ }
})
IEventual(Deferred, {
  when: function($, realized, rejected) {
    if (isRealized($))
      when(valueOf($), realized, rejected)
    else
      privates($).observers.push({ realize: realized, reject: rejected })
  }
})
IDeferred(Deferred, {
  realize: function($, value) {
    if (!isRealized($)) {
      var internals = privates($)
      internals.state = { done: true , value: value }
      internals.observers.forEach(function(observer) {
        when(value, observer.realize, observer.reject)
      })
      internals.observers = null
    }
  }
})

var realize = IDeferred.realize
exports.realize = realize

function defer() {
  return new Deferred({ done: false }, [])
}
exports.defer = defer

function group(promises) {
  return array.reduce(promises, function(promises, promise) {
    return then(promise, function(value) {
      return then(promises, function(values) {
        return array.concat(values, [ value ])
      })
    })
  }, [])
}

function go(f/*, rest */) {
  return then(group(arguments), function(params) {
    var f = params.shift()
    return f.apply(f, params)
  })
}
exports.go = go

function recover(f, eventual) {
  return then(eventual, identity, f)
}
exports.recover = recover

function eventual(f) {
  return function eventually() {
    var params = array.slice(arguments)
    params.unshift(f)
    return go.apply(go, params)
  }
}
exports.eventual = eventual

