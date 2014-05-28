hash.route.js, a simple and flexible routing system.<br>


Setting up hash route listeners and different matching rules:
====

1) Empty match.<br>
``` javascript
// Match empty route
hash("").on("change", function(evt) {
  console.log(arguments);
});
```

2) Exact match. <br>
Will match exact urls.  E.g.

``` javascript
// home, will match
// /home/, will match.  Notice the slashes don't affect pattern matching.
// home/sweet, will not match
hash("home").on("change", function(evt) {
  console.log(arguments);
});
```

3) Exact match with slashes.

``` javascript
// home, will not match
// home/, will match.
// home/sweet, will not match
hash("home/").on("change", function(evt) {
  console.log(arguments);
});
```


4) <code>:</code> parameter values.<br>
Will match the url patterns, extracting and returning the parameter values. E.g.

``` javascript
// home/u21/age -> val1 = 21, val2 = age
hash("home/u:val1/:val2").on("change", function(evt, val1, val2) {
  console.log(arguments);
});
```

5) <code>*:</code> optional parameter values.<br>
Will match patterns returning whatever parameters are found. If a paramter isn't found, the match will be successful but the unmatched data is omitted. E.g.

``` javascript
// home -> val1 = "", val2 = ""
// home/umagic -> val1 = "magic", val2 = ""
// home/umagic/books -> val1 = "magic", val2 = "books"
hash("home/*u:val1/*:val2").on("change", function(evt) {
  console.log(arguments);
});
```

6) <code>**:</code> whole parameter value.<br>
Will return the entire matched paramater. E.g.<br>

``` javascript
// home -> val1 = "", val2 = ""
// home/magic -> val1 = "magic"
// home/magic/books -> val1 = "magic/books"
hash("home/**:val1").on("change", function(evt, val1) {
  console.log(arguments);
});
```

7) <code>/**</code> Wild card<br>
Will match anything, and omit any wild card matched values.

``` javascript
hash("home/**").on("change", function(evt) {
  console.log(arguments);
});
```

A more ellaborate wild card that has a starting exact match and returns the last parameter in the url.

``` javascript
// home/test -> val1 = test
// home/test/candy -> val1 = candy
// home/test/candy/coffee -> val1 = coffee
hash("home/**/:val1").on("change", function(evt) {
  console.log(arguments);
});
```

What events are available?
====

Events that are triggered are:

<code>enter</code> which happens when a route pattern is matched for the firts time.<br>
<code>change</code> which happens when an already matched route pattern changes to a different value that still matches the pattern.<br>
<code>leave</code> which happens when a currently matched pattern changes to a value that no longer matches the route pattern.  This is useful for coordinating house keeping.


How do events work?
====

When route listeners for <code>enter</code> and <code>change</code> are registered, logic for matching the route pattern is executed.  If a match occurs, the newly resgistered <code>enter</code> or <code>change</code> handler will get an event of type <code>init</code> with the correspoding matching results.  Any further changes that still match the pattern will trigger a <code>change</code> event.  When a route transitions from matching to not matching, a <code>leave</code> event is triggered, which is generally a good spot to ungerister listeners and/or do any necessary clean up work.


Install
===============
``` shell
bower install hash.route
```
Or just get directly from git
