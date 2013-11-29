/*
 * Copyright (c) 2013 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/hash.js
 */


(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(this.$);
  }
})
(function( $ ) {
  "use strict";

  var wildCard = {
        "regex":/\/\*\*/g,
        "rule": "(?:.*)"
      },
      wholeValue = {
        "regex":/\*\*:\w+/g,
        "rule": "(.*)"
      },
      optionalValue = {
        "regex": /\*\w*:\w+/g,
        "rule": "([^/]*)"
      },
      nameValue = {
        "regex": /\w*:\w+/g,
        "rule": "([^/]+)"
      },
      oldHash = "",
      newHash = "",
      enabled = false,
      interval = false,
      hashes = {};


  //
  // Hash handler
  //
  function hash( options ) {
    // Convert simple options passed is as a string to a proper options object.
    if ( typeof options === "string" ) {
      options = {
        pattern: options
      };
    }

    if ( options.pattern in hashes === false ) {
      hashes[options.pattern] = hash.route(options);
    }

    return hashes[options.pattern];
  }


  hash.route = function(options) {
    var instance = $({});

    //
    // String used for building up the regexp matches url patterns.
    // Regex tester: http://jsregex.com/
    //
    var matchString = ('' + options.pattern)
      .replace(wholeValue.regex, wholeValue.rule)
      .replace(wildCard.regex, wildCard.rule)
      .replace(optionalValue.regex, function(match) {
        return match.substr(0, match.indexOf(':')) + optionalValue.rule;
      })
      .replace(nameValue.regex, function(match) {
        return match.substr(0, match.indexOf(':')) + nameValue.rule;
      });


    // Regular expression to match against urls.
    // This pattern matching will allow you to accurately specify
    // if you want to match starting and ending slashes when configuring a
    // hash instance.  So, if you specify a slash when configuring your hash,
    // instance the match will test if a slash is included in the url we are
    // testing against.  If you ommit the slash in the hash object, then the
    // match will pass regadless of whether the matching url has a slash.  E.g.
    //
    // var _hash = hash("home") will match #home and #home/
    // var _hash = hash("home/") will only match #home/
    //
    var matchRegExp = new RegExp("^(?:#*/*)" + matchString + "(?:/*)$");

    // Flag to keep track of whether or not this route can execute
    // matching logic
    var enabled = true;


    function match( uri ) {
      if ( !enabled ) {
        return false;
      }

      var _match = uri.match(matchRegExp);
      if ( _match ) {
        // The regex match logic will put the match input in the beginning
        // of the array.  So, remove it to have a precise 1:1 match with
        // the parameters returned to the callbacks
        instance._lastMatch = _match.shift();
      }

      return _match;
    }


    function unregister() {
      delete hashes[instance.pattern];
    }


    function enable(val) {
      if ( arguments.length === 0 ) {
        return enabled === true;
      }
      else {
        enabled = val;
      }
    }


    //
    // Override the $.on method to subscribe events so that we can properly
    // handle firing off an event with the initial value when event handlers
    // are registered.
    //
    var _onEvent = instance.on;
    function onEvent(evt, selector, func) {
      if (typeof selector === "function") {
        func = selector;
      }

      _onEvent.apply(instance, arguments);

      var matches = instance.match('' + window.location.hash);
      if (matches) {
        matches.unshift( jQuery.Event( "init" ) );
        setTimeout(function() {
          func.apply(instance, matches);
        }, 1);
      }

      return instance;
    }


    instance.match = match;
    instance.unregister = unregister;
    instance.enable = enable;
    instance.pattern = options.pattern;
    instance.on = onEvent;
    return instance;
  };


  // Rate at which to trigger updates whenever they exist
  hash.refreshRate = 10;


  //
  // Enable the entire hashing operation
  //
  hash.enable = function(val) {
    if ( enabled ) {
      return;
    }

    enabled = true;

    if ( "onhashchange" in self ) {
      $(self).on("hashchange", throttlechange);
      interval = setTimeout(hashchanged, hash.refreshRate);
    }
    else {
      interval = setInterval(hashchanged, 100);
    }
  };


  //
  // Disable the entire hashing operation
  //
  hash.disable = function(val) {
    if ( enabled === false ) {
      return;
    }

    enabled = false;

    if ( "onhashchange" in self ) {
      $(self).off("hashchange", hashchanged);
      clearTimeout(interval);
    }
    else {
      clearInterval(interval);
    }
  };


  //
  // Allow navigation from hash
  //
  hash.navigate = function(route) {
    window.location.hash = route;
  };


  // Routine to process haschange events
  function hashchanged () {
    newHash = '' + window.location.hash;
    if (newHash === oldHash) {
      return;
    }

    oldHash = newHash;

    // Iterate through all the hashes and fire off a change event if needed.
    for( var i in hashes ) {
      var _hash = hashes[i];
      if ( _hash._lastUpdate === newHash ) {
        continue;
      }

      _hash._lastUpdate = newHash;
      var matches = _hash.match(newHash);
      if ( matches ) {
        _hash.trigger("change", matches);
      }
    }
  }


  // Throttle update events to prevent flooding the hashchanged handler with
  // messages.
  function throttlechange() {
    if ( interval ) {
      clearTimeout(interval);
    }

    interval = setTimeout(hashchanged, hash.refreshRate);
  }


  // Let's start things enabled
  hash.enable(true);
  return hash;
});

