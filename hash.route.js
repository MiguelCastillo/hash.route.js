/**
 * Copyright (c) 2013 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/hash.route.js
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

  var oldHash = "",
      newHash = "",
      interval = false,
      hashChangeAvailable = "onhashchange" in self,
      hashes = {};


  //
  // Hash handler
  //
  function hash( options ) {
    // Convert simple options passed in as a string to a proper options object.
    if ( typeof options === "string" ) {
      options = {
        pattern: options
      };
    }

    if ( options.pattern in hashes === false ) {
      hashes[options.pattern] = new hash.route(options);
    }

    return hashes[options.pattern];
  }


  // Rate at which to trigger updates whenever they exist
  hash.refreshRate = 10;


  //
  // Enable the entire hashing operation
  //
  hash.enable = function() {
    hashChange.enable();
  };


  //
  // Disable the entire hashing operation
  //
  hash.disable = function() {
    hashChange.disable();
  };


  //
  // Allow navigation from hash
  //
  hash.navigate = function(hash) {
    setHash(hash);
  };


  /**
  * returns a normalized hash
  */
  function getHash() {
    return normalizeHash(window.location.hash);
  }


  /**
  * Sets a normalized hash
  */
  function setHash(hash) {
    window.location.hash = normalizeHash(hash);
  }


  /**
  * Normalizes the incoming hash to make sure the "#" is removed if one exists
  */
  function normalizeHash(hash) {
    return (hash || "").replace(/^[\s|\/|#]*/, "");
  }


  /**
  * Routine to process haschange events
  */
  function hashChange () {
    newHash = getHash();
    if (newHash === oldHash) {
      return;
    }

    $(hash).triggerHandler("change", [newHash, oldHash]);

    // Iterate through all the hashes and fire off a change event if needed.
    for ( var i in hashes ) {
      hashes[i].exec(newHash);
    }

    // Update hashes
    oldHash = newHash;
  }


  /**
  * Flag to keep track if hashChange tracking is enabled/disabled.
  */
  hashChange.enabled = false;


  /**
  * Enable tracking of hash changes
  */
  hashChange.enable = (function() {
    var enable;

    if ( hashChangeAvailable ) {
      enable = function() {
        $(self).on("hashchange", throttleHashChange);
        interval = setTimeout(hashChange, hash.refreshRate);
      };
    }
    else {
      enable = function() {
        interval = setInterval(hashChange, 100);
      };
    }

    return function() {
      if ( hashChange.enabled ) {
        return;
      }

      hashChange.enabled = true;
      enable();
    };
  })();


  /**
  * Disable tracking of hash changes
  */
  hashChange.disable = (function() {
    var disable;

    if ( hashChangeAvailable ) {
      disable = function() {
        $(self).off("hashchange", throttleHashChange);
        clearTimeout(interval);
      };
    }
    else {
      disable = function () {
        clearInterval(interval);
      };
    }

    return function () {
      if ( hashChange.enabled === false ) {
        return;
      }

      hashChange.enabled = false;
      disable();
    };
  })();


  /**
  * Throttle update events to prevent flooding the hashchanged handler with
  * messages.
  */
  function throttleHashChange() {
    if ( interval ) {
      clearTimeout(interval);
    }

    interval = setTimeout(hashChange, hash.refreshRate);
  }


  /**
  * Pattern matching building logic.  This is just a collection of rules used to determine
  * how patterns are matched and what needs to be extracted out when a pattern matches.
  */
  function patternMatch(pattern) {
    var rules = patternMatch.rules;

    //
    // String used for building up the regexp matches url patterns.
    // Regex tester: http://jsregex.com/
    //
    var matchString = ('' + pattern)
      .replace(rules.wholeValue.regex, function(match) {
        return match.substr(0, match.indexOf(':')) + rules.wholeValue.rule;
      })
      .replace(rules.optionalValue.regex, function(match) {
        return match.substr(0, match.indexOf(':')) + rules.optionalValue.rule;
      })
      .replace(rules.nameValue.regex, function(match) {
        return match.substr(0, match.indexOf(':')) + rules.nameValue.rule;
      })
      .replace(rules.wildCard.regex, rules.wildCard.rule);

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

    return function(uri) {
      return uri.match(matchRegExp);
    };
  }


  patternMatch.rules = {
    wildCard: {
      "regex":/\/\*\*/g,
      "rule": "(?:.*)"
    },
    wholeValue: {
      "regex":/\*\*\w*:\w+/g,
      "rule": "(.*)"
    },
    optionalValue: {
      "regex": /\*\w*:\w+/g,
      "rule": "([^/]*)"
    },
    nameValue: {
      "regex": /\w*:\w+/g,
      "rule": "([^/]+)"
    }
  };



  /**
  * Route handler.  This is where all the setup and matching magic happens
  */
  function route(options) {
    var instance  = $({}),
        matchUri  = hash.patternMatch(options.pattern),
        currMatch = null,
        prevMatch = null,
        enabled   = true;


    function match( uri ) {
      if ( !enabled ) {
        return false;
      }

      var matches = matchUri(uri);
      prevMatch   = currMatch;

      if ( matches ) {
        // Javascript regex match will put the match input in the beginning
        // of the matches array.  So, remove it to have a precise 1:1 match
        // with the parameters returned to the callbacks
        instance.currUrl = matches.shift();
        currMatch        = matches.join("-");
      }
      else {
        // Clear up the value to have a proper initial state when comparing
        // last match again
        instance.currUrl = null;
        currMatch        = null;
      }

      return matches;
    }


    function exec( uri ) {
      var matches = match(uri);

      // If there is a match and old and new match are different, then we trigger
      // a route change.
      if ( matches && prevMatch !== currMatch ) {
        if ( prevMatch === null ) {
          instance.triggerHandler("enter", matches);
          $(hash).triggerHandler("route:enter", [instance, matches]);
        }

        instance.triggerHandler("change", matches);
        $(hash).triggerHandler("route:change", [instance, matches]);
      }
      else if ( !matches && prevMatch !== null ) {
        instance.triggerHandler("leave");
        $(hash).triggerHandler("route:leave", [instance]);
      }
    }


    function unregister() {
      $(hashes[instance.pattern]).off();
      delete hashes[instance.pattern];
    }


    function enable(val) {
      if ( arguments.length === 0 ) {
        return enabled === true;
      }
      else {
        enabled = !!val;
      }
    }


    function init(/*evt, filter, callback*/) {
      var evtName  = arguments[0],
          filter   = arguments[1],
          callback = arguments[2],
          matches  = null;

      if ( typeof filter === "function" ) {
        callback = filter;
      }

      if ( evtName === "enter" || evtName === "change" ) {
        matches = instance.match( getHash() );

        if (matches) {
          matches.unshift( $.Event( "init" ) );

          setTimeout(function() {
            callback.apply(instance, matches);
            $(hash).triggerHandler("route:" + evtName, instance);
          }, 1);
        }
      }

      _onEvent.apply(instance, arguments);
      return instance;
    }

    //
    // Monkey patch $.on method to handle firing off an event with
    // the initial value when event handlers are registered.
    //
    var _onEvent = instance.on;
    instance.on  = init;

    instance.matchUri   = matchUri;
    instance.match      = match;
    instance.exec       = exec;
    instance.unregister = unregister;
    instance.enable     = enable;
    instance.pattern    = options.pattern;
    return instance;
  }


  hash.patternMatch = patternMatch;
  hash.route        = route;

  // Let's start things enabled
  hash.enable(true);
  return hash;
});

