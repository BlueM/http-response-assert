const debug = require('debug')('@bluem/http-response-assert:handler:header');
const matcher = require('../matcher');

/**
 * Performs case-sensitive check on a expected response header vs. actual response header
 *
 * Example assertions:
 *   - Header "Content-Type" contains "text/html"
 *   - Header "Content-Type" is "text/html; charset=utf-8"
 *   - Header "Content-Type" starts with "text/html"
 *   - Header "X-Content-Type-Options" is not set
 *
 * @param headers
 * @param statusCode
 * @param body
 * @param matcherData
 *
 * @returns {*}
 */
module.exports = function (headers, statusCode, body, matcherData) {

    debug('matcherData: %o', matcherData);

    if (matcherData.length < 3) {
        throw new Error('Invalid assertion');
    }

    const headerName = matcherData.shift().toLowerCase();
    const actualValue = headers[headerName];

    debug('Header name: %s', headerName);
    debug('Actual value: %s', actualValue);

    const result = matcher(actualValue, matcherData);
    if (null === result) {
        return null;
    }

    return `Header “${headerName}”: ${result}`;
};
