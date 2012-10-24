"use strict";

var Eventual = require("./type")
module.exports = function defer() { return new Eventual() }
