# Overview

`http-response-assert` is a Node.js module for performing assertions on HTTP responses which are received after sending requests. These assertions can include things like status code, HTTP headers, response text or CSS selectors and are therefore suitable for simple website or API behavior monitoring.

While the module is basically generic, it was written to be used in “Serverless” functions (AWS Lambda, Google Cloud Functions, Azure Functions etc), in order to perform simple behaviour verification of web applications. Doing that using code (as opposed to configuring a monitoring service where you hand-craft checks in the GUI) means that checks can be version-controlled, branched and automatically deployed.

Requests are done using the widely known [“request” npm module](https://www.npmjs.com/package/request), which means that requests can do anything that the “request” module offers. This includes:

* any HTTP methods
* any content types
* arbitrary headers
* form data

Out of the box, this module is able to:

* Verify response HTTP status code
* Perform checks on response headers
* Perform plaintext content checks for a number of content types (most importantly: HTML)
* Perform checks (either existence, non-existence or content) using CSS selectors
* Perform checks (either existence, non-existence or content) using JSON pointer expressions
* Perform checks (either existence, non-existence or content) using XPath pointer expressions
* Perform checks on the raw response body
* Perform completely arbitrary checks using callback functions


# Usage

Usage is simple and straightforward:

* ``require()`` the module
* Instantiate the class you imported from the module
* Invoke the `addCheck()` method on the instance, giving it a URL, an array of assertions (see below) and, optionally, request options
* Add more `addCheck()` calls, if needed
* Invoke the `run()` method, which will return a promise which will either resolve to a success string (no network problems, all assertions passed) or an error string (network problems and/or at least one assertion failed)

## Assertions
Each assertion (with the exception of custom assertion functions) should be a (more or less) “sentence” describing the desired behavior – example: “Text does not contain "Hello world"”. After the response is received, in this example it will be passed on to the text handler, which will convert the response body (HTML, JSON, XML, ...) to plaintext and then verify that the phrase “Hello world” is not present.

In each assertion, the first word (which is treated case-insensitively) must specify the type of assertion:

* `Code` for assertions based on the received HTTP status code
* `CSS` for assertions based on a CSS selector applied to the response body
* `Header` for assertions based on a received HTTP header
* `JSON` for assertions based on a JSON path expression applied to the response body
* `Raw` for assertions based on the raw, unprocessed response body. (For better readability, you can also write “Raw body” or “Raw content” instead of “Raw”.)
* `Selector` is an alias for `CSS`
* `Status` is an alias for `Code`
* `Text` for assertions based on a plaintext representation of the response body
* `XPath` for assertions based on an XPath expression applied to the response body

The “matcher” string (in the example above: “does not contain”) supports a number of wordings such as “contains”, “starts with”, “does not exist” (which is primarily useful for headers), “is” etc. See `matcher.js` for details.


###  Custom assertion functions

Instead of an assertion string, you can also include a function in the assertion array. The function will be passed three arguments:

* An array of response headers
* The response HTTP status code
* The response body

The function should return either `null` (assertion passed) or a string describing the error(s).


### Custom handlers

If you need an assertion handler which is not included and do not want to use an anonymous function, you can load additional handler(s) from a directory you pass in an options object to the constructor:

    new HttpResponseAssert({handlerDir: './my-handlers-directory'});

This way, you could also overwrite an included handler: handlers are read and kept in an object with the filename (minus extension) as property, you can replace an included handler by having an own handler with the same filename as an existing handler.
 

## Example
The following example will check the behavior of http://example.com. It uses all currently existing handlers, with the exception of the JSON handler, which just would not make sense for an HTML document.

```js
const HttpResponseAssert = require('@bluem/http-response-assert');

let hra = new HttpResponseAssert;

hra.addCheck(
   `http://example.com`,
   [
       // Check for status code
       'Code is 200',
       // Header checks
       // Note: header names are treated case-insensitively
       'Header "X-Content-Type-Options" is not set',
       'Header "Content-Type" starts with "text/html"',
       // Plaintext checks, with HTML content automatically
       // converted to plaintext with tags, comments, <script>
       // and <style> removed.
       'Text contains "You may use this domain"',
       'Text does not contain "Error"',
       'Text does not contain "font-family"',
       // CSS selector check
       'Selector "div > p" contains "illustrative examples"',
       // XPath check
       `XPath "//h1" is "Example Domain"`,
       // Custom assertion function
       (headers, statusCode, body) => {
           // Useless example, as this could have been done
           // easier using 'Text contains "examples"'.
           if (-1 === body.indexOf('examples')) {
               return 'Expected body to contain “examples”';
           }
           return null;
       }
   ]
);

hra.run()
   .then((msg) => {
       // Success
       console.log(msg);
   })
   .catch((err) => {
       // Some kind of failure
       // Do whatever is appropriate: log it, send mail, notify via Slack, ...
       console.error(err);
   });
```


## Debug output

This module uses the [debug module](https://www.npmjs.com/package/debug) for enabling debug output. This means that using an environemnt variable named “DEBUG” you can control whether you would like to get debug output for this module and, if yes, what kind of debug output:

* To get debug output only for the module core (`index.js`), use it like this: `DEBUG=@bluem/http-response-assert node script.js`

* To get debug output for a specific assertion handler (example: the handler for testing JSON path expressions), use it like this: `DEBUG=@bluem/@bluem/http-response-assert:handler:json node script.js`

You may also use `*` as a wildcard, so the following will both work:

* `DEBUG=@bluem/http-response-assert* node script.js`
* `DEBUG=@bluem/@bluem/http-response-assert:handler:* node script.js`


## Running tests
* `npm run test` Unit tests
* `npm run test-coverage` Unit tests, with coverage in `./coverage`

# ToDo

## Handler aliases
Nice additions would be:

* “Status code” as alias for “Code”
* “JSON pointer” as alias for “JSON”

## RegEx matching
It should be possible to specify an assertion using a RegEx, for instance `Text matches "/foo[0-9]+bar/"`.

## Track timing
It should be possible to record information on the time needed for requests.


# Change

## 0.4
* Constructor function takes option object which supports keys "timeout" and "agent" for setting request timeout and user agent string.
* Additional handlers can be loaded from a directory to be specified using key "handlerDir" on the options object
 