const HttpResponseAssert = require('@bluem/http-response-assert');

let hra = new HttpResponseAssert();

hra.addCheck(
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
