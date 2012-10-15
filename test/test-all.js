/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true globalstrict: true */

"use strict";

var eventual = require('../decorate')
var apply = require('../apply')
var defer = require('../defer')
var deliver = require('pending/deliver')

var sum = eventual(function(a, b) { return a + b })

exports['test non-eventual values'] = function(assert) {
  assert.equal(sum(2, 3), 5, 'call on non-eventuals returns value')
}

exports['test apply non-eventual'] = function(assert) {
  ;[
    { a: 1 },
    [ 'b', 2 ],
    'hello world',
    5,
    /foo/,
    function bar() {},
    Date(),
    undefined,
    null
  ].forEach(function(expected) {
    apply(function(actual) {
      assert.equal(actual, expected, 'apply can be called on: ' + expected)
    }, expected)
  })
}

exports['test delivered eventuals'] = function(assert) {
  var a = defer(), b = 3
  deliver(a, 1)

  assert.equal(sum(a, b), 4, 'call on delivered eventual returns value')
}

exports['test apply on eventuals'] = function(assert) {
  ;[
    { a: 1 },
    [ 'b', 2 ],
    'hello world',
    5,
    /foo/,
    function bar() {},
    Date(),
    undefined,
    null
  ].forEach(function(expected) {
    var value = defer()
    deliver(value, expected)
    apply(function(actual) {
      assert.equal(actual, expected, 'apply works with eventual: ' + expected)
    }, value)
  })
}

exports['test undelivered eventuals'] = function(assert) {
  var expected = 7
  var a = defer()
  var b = sum(a, 1)

  assert.ok(typeof(b) === 'object', 'call on non-delivered returns eventual')

  var c = sum(b, 3)

  apply(function(value) {
    assert.equal(value, expected, 'eventual resolved as expected')
  }, a)

  apply(function(value) {
    assert.equal(value, expected + 1, 'eventual operation resolved as expected')
  }, b)

  apply(function(value) {
    assert.equal(value, expected + 1 + 3, 'eventuals chain as expected')
  }, c)

  deliver(a, expected)
}


if (module == require.main)
  require("test").run(exports);

