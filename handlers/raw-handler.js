const debug = require('debug')('@bluem/http-response-assert:handler:raw');
const matcher = require('../matcher');

function supports(typeIdentifier) {
    return typeIdentifier === 'raw';
}

/**
 * Checks the raw, unprocessed response body
 *
 * @param headers
 * @param statusCode
 * @param body
 * @param matcherData
 *
 * @returns {*}
 */
function check(headers, statusCode, body, matcherData) {

    debug('matcherData: %o', matcherData);

    // Make it possible to use "Raw body" or "Raw content", i.e.: remove leading "body" or "content"
    if (-1 < ['body', 'content'].indexOf(matcherData[0].toLowerCase())) {
        matcherData.shift();
    }

    const result = matcher(body, matcherData);
    if (null === result) {
        return null;
    }

    return `Raw body: ${result}`;
}

module.exports = {supports, check};
