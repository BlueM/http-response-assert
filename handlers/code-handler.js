const debug = require('debug')('@bluem/http-response-assert:handler:code');

function supports(typeIdentifier) {
    return typeIdentifier === 'code' || typeIdentifier === 'status';
}

/**
 * @todo
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

    if (matcherData.length !== 2 ||
        matcherData[0].toLowerCase() !== 'is' ||
        !matcherData[1].match(/^\d{3}$/)) {
        throw new Error(
            'The status code matcher expects the assertion to be “is XXX”, ' +
            'where “XXX is a three-digit HTTP status code'
        );
    }

    if (String(statusCode) === String(matcherData[1])) {
        return null;
    }

    return `Expected status code ${matcherData[1]}, got ${statusCode}`;
}

module.exports = {supports, check};
