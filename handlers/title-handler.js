const debug = require('debug')('@bluem/http-response-assert:handler:title');
const checkXPath = require('../service/check-xpath');

function supports(typeIdentifier) {
    return typeIdentifier === 'title';
}

/**
 * Verifies the a page title
 *
 * @param headers
 * @param statusCode
 * @param body
 * @param matcherData
 *
 * @returns {*}
 */
function check(headers, statusCode, body, matcherData) {
    const xPath = '/html/head/title';
    debug('XPath expression for the page title: %s', xPath);

    const result = checkXPath(xPath, body, matcherData);

    if (null === result) {
        return null;
    }

    return `Title: ${result}`;
}

module.exports = {supports, check};
