const debug = require('debug')('@bluem/http-response-assert:handler:text');
const matcher = require('../matcher');
const htmlToPlaintext = require('html2plaintext');

function supports(typeIdentifier) {
    return typeIdentifier === 'text';
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

    const actualValue = getPlaintext(headers['content-type'], body);

    const result = matcher(actualValue, matcherData);
    if (null === result) {
        return null;
    }

    return `Text: ${result}`;
}

function getPlaintext(rawContentTypeHeader, body) {
    if (!rawContentTypeHeader) {
        throw new Error('No “Content-Type” header present');
    }

    const mimeType = rawContentTypeHeader.trim().split(/ *; */)[0].toLowerCase();

    switch (mimeType) {
        case 'application/atom+xml':
        case 'application/rss+xml':
        case 'application/xml':
        case 'text/html':
        case 'text/xml':
            return htmlToPlaintext(body);

        case 'text/css':
            return body;

        case 'application/javascript':
        case 'text/javascript':
            return body;

        default:
            throw new Error('Unsupported MIME type: ' + mimeType);
    }
}

module.exports = {supports, check};
