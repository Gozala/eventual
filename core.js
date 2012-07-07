/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Method = require('method')
var $ = require('./eventual'),
    defer = $.defer, when = $.when, deliver = $.deliver

// Define a shortcut for `Array.prototype.slice.call`.
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

function group(eventuals) {
  return slice(eventuals).reduce(function(eventuals, eventual) {
    return when(eventual, function(value) {
      return when(eventuals, function(values) {
        values.push(value)
        return values
      })
    })
  }, [])
}

function go(f/*, rest */) {
  return when(group(arguments), function(params) {
    var f = params.shift()
    return f.apply(f, params)
  })
}
exports.go = go

function recover(f, eventual) {
  return when(eventual, identity, f)
}
exports.recover = recover

function eventual(f) {
  return function eventually() {
    var params = slice(arguments)
    params.unshift(f)
    return go.apply(go, params)
  }
}
exports.eventual = eventual

