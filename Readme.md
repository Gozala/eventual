# eventual

[![Build Status](https://secure.travis-ci.org/Gozala/eventual.png)](http://travis-ci.org/Gozala/eventual)

An abstraction for eventual values.

## What is an eventual value?

An eventual value is a placeholder for values that will be
recieved asyncronously *at some point in the future*. Eventual values are typically
used in place of callbacks for asyncronous operations. They allow you to
return a deferred value *syncronously* that will be resolved
*asyncronously*. Using deferred values allows you describe
asyncronous actions in a syncronous fashion.

You may have seen eventual value abstractions before: `jQuery.deferred` and
`Promise` are both abstractions layers for eventual values.

## Install

    npm install eventual

## Usage
