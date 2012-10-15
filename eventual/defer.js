/*jshint asi: true undef: true es5: true node: true devel: true
         globalstrict: true forin: true latedef: false supernew: true */
/*global define: true */

"use strict";

var Eventual = require("./type")
module.exports = function defer() { return new Eventual() }

