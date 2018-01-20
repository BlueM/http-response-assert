const debug = require('debug')('@bluem/http-response-assert:handler:json');
const jsonPointer = require('jsonpointer');
const matcher = require('../matcher');

function supports(typeIdentifier) {
    return typeIdentifier === 'json';
}

/**
 * Performs case-sensitive checks on JSON path expressions
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

    let jsonObject;
    try {
        jsonObject = JSON.parse(body);
    } catch (e) {
        return 'Could not JSON-decode response body';
    }

    const jsonPointerPath = matcherData.shift();

    debug('Parsed JSON: %o', jsonObject);
    debug('JSON pointer: %s', jsonPointerPath);
    debug('Matcher data: %s', matcherData);

    let actualValue = jsonPointer.get(jsonObject, jsonPointerPath);

    if (undefined !== actualValue) {
        actualValue = String(actualValue);
    }

    const result = matcher(actualValue, matcherData);

    if (result === null) {
        return null;
    }

    return `Check for JSON pointer “${jsonPointerPath}”: ${result}`;
}

module.exports = {supports, check};