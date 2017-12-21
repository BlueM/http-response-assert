# Overview

`http-response-assert` is a Node.js module for performing assertions on HTTP responses which are received after sending requests. These assertions can include things like status code, HTTP headers, text contain or CSS selectors and are therefore suitable for simple website or API behavior monitoring.

While the module is basically generic, it was written to be used in “Serverless” functions (AWS Lambda, Google Cloud Functions, Azure Functions etc), in order to perform simple behaviour verification of web applications. Doing that using code (as opposed to configuring a monitoring service where you hand-craft checks in the GUI) means that checks can be version-controlled, branched and automatically deployed.

Requests are done using the widely known [“request” npm module](https://www.npmjs.com/package/request), which means that requests can do anything that the “request” module offers. This includes:

* any HTTP methods
* any content types
* arbitrary headers
* form data



# Usage

*To be added*


# Known problems

## Text matcher
* When converting HTML to plaintext, text inside `<script>` or `<style>` is not removed.


# ToDo

## RegEx matching
It should be possiblt to specify an assertion such as "Text matches /foo(?:bar)?baz/".

## Adding own matchers
It should be possible to define own matchers or load 3rd party matchers

## Track timing
It should be possible to record information on the time needed for requests
