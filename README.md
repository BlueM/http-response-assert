# Overview

Node.js module for performing assertions on HTTP responses which are received after sending requests. These assertions can include things like the status code, HTTP headers, response text, XPath expressions, JSON paths etc and are therefore suitable for simple website or API behavior monitoring. Additionally, the response time and other timing metrics are returned together with the test results, which can be handy for tracking performance changes over time.

While the module is basically generic, it was written to be used in “Serverless” functions (AWS Lambda, Google Cloud Functions, Azure Functions etc). Doing that using code (as opposed to configuring a monitoring service where you hand-craft checks in the GUI) means that checks can be version-controlled, branched, automatically deployed and both triggered periodically or explicitly, for instance as a smoke test immediately after a deployment.

Requests can be run sequentially or with a configurable concurrency. As the requests are done using the widely known [“request” npm module](https://www.npmjs.com/package/request), you can do anything that the “request” module offers (which is *a lot*), including:

* any HTTP methods
* any content types
* arbitrary headers
* form data
* HTTP authentication
* etc.

Out of the box, this module is able to:

* Verify response HTTP status code
* Perform checks on response headers
* Perform plaintext content checks for a number of content types (most importantly: HTML)
* Perform checks (either existence, non-existence or content) using CSS selectors
* Perform checks (either existence, non-existence or content) using JSON pointer expressions
* Perform checks (either existence, non-existence or content) using XPath expressions
* Perform checks on the raw response body
* Perform completely arbitrary checks using callback functions
* Record request/response timing information

In addition, it is possible to write own checks.


# Usage

Usage is simple and straightforward:

* ``require()`` the module
* Instantiate the class you imported from the module (optionally, give options to the constructor function)
* Invoke the `addTest()` method on the instance, giving it a URL, an array of assertions (see below) and, optionally, request options
* Add more `addTest()` calls, if needed
* Invoke the `run()` method, which will return a promise which will resolve in case of success (no network problems, all assertions passed) or reject in case of an error (network problems and/or at least one assertion failed). The value both for resolve and reject is an object with keys “summary” and “results”. Please see example for more info.

## Options
When calling the constructor function, you can pass in an object with any of these options:

* `handlerDir`: Filesystem path to a directory containing additional handlers (i.e.: small modules which provide checks of a certain type); defaults to none
* `timeout`: Request timeout in milliseconds; defaults to 3000
* `agent`: User-agent string to send with request; defaults to “http-response-assert”
* `concurrency`: Number of concurrent requests to open; defaults to 1
* `delay`: Number of milliseconds to wait before sending the next request; defaults to 100

As you can see, the default options are rather conservative when it comes to load on the target server. For example, if you wanted to use up to 10 simultaneous requests and delay them each by 20 milliseconds, you could specify the options as `{concurrency: 10, delay: 20}` to speed things up.


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
The following example will check the behavior of http://example.com, using only a few of the currently existing handlers.

```js
const HttpResponseAssert = require('@bluem/http-response-assert');

let hra = new HttpResponseAssert();

hra.addTest(
    'http://example.com',
    [
        // Check for status code
        'Code is 200',
        // Header checks
        'Header "Content-Type" starts with "text/html"',
        // Plaintext checks, with HTML content automatically
        // converted to plaintext with tags, comments, <script>
        // and <style> removed.
        'Text contains "You may use this domain"',
        'Text matches "You [a-z ]+ domain"',
        'Text does not contain "font-family"',
        // CSS selector check
        'Selector "div > p" contains "illustrative examples"',
        // Raw body check
        'Raw body contains "<h1>Example Domain</h1>"',
    ]
);

hra.run()
    .then((result) => {
        // Success
        console.log(result.summary);
    })
    .catch((result) => {
        // Some kind of failure
        // Do whatever is appropriate: log it, send mail, notify via Slack, ...
        console.error(result.summary);
    });
```

For a more complete example (including detailed reportig of passed and failed assertions, as well as timing information), see `example.js`.


## Debug output

This module uses the [debug module](https://www.npmjs.com/package/debug) for enabling debug output. This means that using an environemnt variable named “DEBUG” you can control whether you would like to get debug output for this module and, if yes, what kind of debug output:

* To get debug output only for the module core (`index.js`), use it like this: `DEBUG=@bluem/http-response-assert,@bluem/http-response-assert:network:* node script.js`

* To get debug output for a specific assertion handler (example: the handler for testing JSON path expressions), use it like this: `DEBUG=@bluem/@bluem/http-response-assert:handler:json node script.js`

You may also use `*` as a wildcard, so the following will both work:

* `DEBUG=@bluem/http-response-assert* node script.js`
* `DEBUG=@bluem/@bluem/http-response-assert:handler:* node script.js`


## Running tests
* `npm run test` Unit tests
* `npm run test-coverage` Unit tests, with coverage in `./coverage`



# Changes

## 0.6.1 (2018-01-25)
* Fixes error in summarizing results

## 0.6 (2018-01-24)
* Added details on passed and failed tests
* Added detailed timing information on performed requests.
* Breaking change: Method `addCheck` renamed to `addTest()`. (Equally, in the summary you will get, the wording is now “test” instead of “check”).
* Breaking change: the value to which the promise that is returned from calling `run()` resolves has changed. It used to be a string containing a success or error summary, but is now an object with the following properties: `summary` (string describing test result, incl. number of passed and failed tests) and `results` (an object which, for each test, summarizes the passed and failed assertions and contains request timing information).
* The third argument to the `addTest()` method is still an optional array of request options, but in addition to (or instead of) request options, you can use a property “title” in the object to define a title/name for the test, which will then be used in the detailed results. If not set, a title will be auto-generated from HTTP method and URL.

## 0.5 (2018-01-21)
* Number of concurrent requests and delay between requests can be specified through the options passed to the constructor function.
* New matcher: “matches” for RegEx matching and “matches not” or “not matches” or “does not match” for making sure a RegEx does not match (see example above).

## 0.4 (2018-01-20)
* Constructor function takes option object which supports keys "timeout" and "agent" for setting request timeout and user agent string.
* Additional handlers can be loaded from a directory to be specified using key "handlerDir" on the options object
