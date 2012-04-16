/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

"use strict";

var core = require('../core'),
    eventual = core.eventual,
    deliver = core.deliver,
    wait = core.wait,
    Reactor = core.Reactor

var sum = eventual(function(a, b) { return a + b })

exports['test non-eventual values'] = function(assert) {
  assert.equal(sum(2, 3), 5, 'call on non-eventuals returns value')
}

exports['test wait non-eventual'] = function(assert) {
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
    wait(expected, function(actual) {
      assert.equal(actual, expected, 'wait can be called on: ' + expected)
    })
  })
}

exports['test delivered eventuals'] = function(assert) {
  var a = Reactor(), b = 3
  deliver(a, 1)

  assert.equal(sum(a, b), 4, 'call on delivered eventual returns value')
}

exports['test wait on eventuals'] = function(assert) {
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
    var value = Reactor()
    deliver(value, expected)
    wait(value, function(actual) {
      assert.equal(actual, expected, 'wait works with eventual: ' + expected)
    })
  })
}

exports['test undelivered eventuals'] = function(assert) {
  var expected = 7
  var a = Reactor()
  var b = sum(a, 1)

  assert.ok(typeof(b) === 'object', 'call on non-delivered returns eventual')

  var c = sum(b, 3)

  wait(a, function(value) {
    assert.equal(value, expected, 'eventual resolved as expected')
  })

  wait(b, function(value) {
    assert.equal(value, expected + 1, 'eventual operation resolved as expected')
  })

  wait(c, function(value) {
    assert.equal(value, expected + 1 + 3, 'eventuals chain as expected')
  })

  deliver(a, expected)
}


if (module == require.main)
  require("test").run(exports);

})
