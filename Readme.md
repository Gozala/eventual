# eventual

[![Build Status](https://secure.travis-ci.org/Gozala/eventual.png)](http://travis-ci.org/Gozala/eventual)

Eventuals let you travel through time to use future values.

## What is an eventual value?

An eventual value is a placeholder for a value that will be
received asyncronously *at some point in the future*. Eventuals values are
a powerful alternative to callbacks when dealing with asyncronous operations. 

By giving you a way to return future values immediately, eventuals help
you avoid nested callback hell. They also make it easy to describe asyncronous
control flows that are difficult to handle with callbacks ("do this when
x and y are ready, then wait for any of a, b and c, and do that").

You may have seen eventual value abstractions before: `jQuery.deferred` and
`Promise` are both abstractions for eventual values.

Like these, Eventuals allow you to compose, combine and handle errors for
async operations. But it can also bend time and space: decorate any ordinary
function, and it will accept eventual values as if they were available now!

## Install

    npm install eventual

## Show me how...

Let's create an eventual version of Node's `readFile`.

    // Require our library files...
    var eventuals = require('eventual'),
        defer = eventuals.defer,
        deliver = eventuals.deliver,
        when = eventuals.when;
    
    var fs = require('fs');
    
    // Create our readFile function.
    function readFile(file, encoding) {
      // Create a deferred value.
      var deferredFileContents = defer();
      
      fs.readFile(file, (encoding || 'utf8'), function (err, contents) {
        // When file is read, deliver the contents. If there is an
        // error, deliver that instead.
        deliver(deferredFileContents, (err || contents));
      }
      return deferredFileContents;
    }
    
    var deferredFoo = readFile('foo.txt');

    when(deferredFoo, myCallback, myErrback);

    var deferredBar = readFile('bar.txt');

    var deferredBoth = group([deferredFoo, deferredBar]);
    when(deferredBoth, myOtherCallback, myOtherErrback);

## Travel through time

You can decorate any function, allowing it to take a mixture of
eventual and normal values. When all of the arguments are fulfilled,
the function will be invoked with the fulfilled values.

    
    var eventuallyConcatFiles = eventual(concatFiles);
    var eventuallyProcessFile = eventual(processFile);
    
    var foo = readFile('foo.txt');
    var bar = readFile('bar.txt');
    var concatenated = eventuallyConcatFiles(foo, bar);
    var processed = eventuallyProcessFile(concatenated, 'markdown');

There you have it! Completely asyncronous operations from syncronous functions
used in a syncronous style!
