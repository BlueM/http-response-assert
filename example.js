// The next line assumes you run it from within the "@bluem/http-response-assert" module.
const HttpResponseAssert = require('./index');
// To rather run this example from a codebase where the module is included
// as a dependency, use this line instead:
// const HttpResponseAssert = require('@bluem/http-response-assert');

let hra = new HttpResponseAssert();

hra.addTest(
    'http://example.com',
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
        'Text matches "You [a-z ]+ domain"',
        'Text does not contain "Error"',
        'Text does not contain "font-family"',
        // CSS selector check
        'Selector "title" is "Example Domain"',
        'Selector "div > p" contains "illustrative examples"',
        // Raw body check
        'Raw body contains "<h1>Example Domain</h1>"',
        // XPath check
        `XPath "//h1" is "Example Domain"`,
        // Custom assertion callback
        (headers, statusCode, body) => {
            // Useless example, as this could have been done
            // easier using 'Text contains "examples"'.
            if (-1 === body.indexOf('examples')) {
                return 'Expected body to contain “examples”';
            }
            return null;
        }
    ]
    // As third argument, you may pass in an object containing request options.
    // These options are exactly those options which will be forwarded to the
    // npm "request" module, so refer to request's docs for more information.
    // Additionally, the object may contain a property "title", which is an
    // arbitrary string which will be used in the detailed test results to
    // identify/describe the test.
);

// If tests are all successful or not: the result value is an object with a
// property "summary" (short description of test results) and a property
// "results" containing an array of test results (one per test), where each
// array entry is an object with keys "title" (name of the test, either as
// specified by you or auto-generated from method and URL), "passed",
// "failed", "timingStart", "timing" and "timingPhases". For the latter 3
// properties, please consult the docs for the "request" npm module.
hra.run()
    .then((result) => {
        // Success
        console.log(result.summary);
        logDetailedResults(result.results);
    })
    .catch((result) => {
        // Some kind of failure
        // Do whatever is appropriate: log it, send mail, notify via Slack, ...
        console.error(result.summary);
        logDetailedResults(result.results);
    });

/**
 * Logs details of all executed tests, with all passed and failed assertions,
 * including response time
 */
function logDetailedResults(results) {
    const tests = results.map(result => {
            return `
----- ${result.title} -----

Passed:
  ${result.passed.length ? '* ' + result.passed.join('\n  * ') : '--'}
Failed:
  ${result.failed.length ? '* ' + result.failed.join('\n  * ') : '--'}
Time: ${Math.max(1, Math.round(result.timingPhases.firstByte))} ms`
        }
    );
    console.log(`\nDETAILED RESULTS:\n${tests.join('\n')}`);
}
