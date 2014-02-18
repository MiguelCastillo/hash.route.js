hash.route.js, a simple and flexible routing system.
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


4) : parameter values.<br>
Will match the url patterns, extracting and returning the parameter values. E.g.

``` javascript
// home/u21/age -> val1 = 21, val2 = age
hash("home/u:val1/:val2").on("change", function(evt, val1, val2) {
  console.log(arguments);
});
```

5) *: optional parameter values.<br>
Will match patterns returning whatever parameters are found. If a paramter isn't found, the match is will be successfull but the unmatched data isn't returned. E.g.

``` javascript
// home -> val1 = "", val2 = ""
// home/umagic -> val1 = "magic", val2 = ""
// home/umagic/books -> val1 = "magic", val2 = "books"
hash("home/*u:val1/*:val2").on("change", function(evt) {
  console.log(arguments);
});
```

6) **: whole parameter value.<br>
Will return the whole paramater. E.g.<br>

``` javascript
// home -> val1 = "", val2 = ""
// home/magic -> val1 = "magic"
// home/magic/books -> val1 = "magic/books"
hash("home/**:val1").on("change", function(evt, val1) {
  console.log(arguments);
});
```

7) /** Wild card<br>
Will match anything

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
