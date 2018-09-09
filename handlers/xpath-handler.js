const debug = require('debug')('@bluem/http-response-assert:handler:xpath');
const checkXPath = require('../service/check-xpath');

function supports(typeIdentifier) {
    return typeIdentifier === 'xpath';
}

/**
 * Performs an XPath assertion check on the response
 *
 * @param headers
 * @param statusCode
 * @param body
 * @param matcherData
 *
 * @returns {*}
 */
function check(headers, statusCode, body, matcherData) {

    if (matcherData.length < 2) {
        throw new Error(`Invalid XPath assertion: Matcher data consists of less than two strings.\nMatcher data:\n${matcherData}\n`);
    }

    const xPath = matcherData.shift();
    debug('XPath expression: %s', xPath);

    const result = checkXPath(xPath, body, matcherData);

    if (null === result) {
        return null;
    }

    return `XPath “${xPath}”: ${result}`;
}

module.exports = {supports, check};
