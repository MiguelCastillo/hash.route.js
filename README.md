hash.js, a simple and flexible routing system.
====


1. Exact match.<br>
Will match exact urls. E.g.

``` javascript
// home, will match
// home/sweet, will not match
hash("home").on("change", function(evt) {
  console.log(arguments);
});
```

2. : parameters.<br>
Will match the url patterns, extracting the parameter values which are then returned. E.g.

``` javascript
// home/u21/test/age -> val1 = 21, val2 = age
hash("home/u:val1/test/:val2").on("change", function(evt, val1, val2) {
  console.log(val1, val2);
});
```

3. /* optional parameters<br>
Will match patterns returning whatever parameters are found. If a paramter isn't found, the match is will be successfull but the unmatched data isn't returned. E.g.

``` javascript
// home -> val1 = "", val2 = ""
// home/magic -> val1 = "magic", val2 = ""
// home/magic/books -> val1 = "magic", val2 = "books"
hash("home/*:val1/*:val2").on("change", function(evt) {
  console.log(arguments);
});
```

4. /** Wild card<br>
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
