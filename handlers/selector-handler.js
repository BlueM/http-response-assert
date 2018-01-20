const debug = require('debug')('@bluem/http-response-assert:handler:selector');
const matcher = require('../matcher');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

function supports(typeIdentifier) {
    return typeIdentifier === 'css' || typeIdentifier === 'selector';
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

    if (matcherData.length < 2) {
        throw new Error('Invalid assertion');
    }

    const selector = matcherData.shift();

    // Add a virtual console for suppressing warnings, e.g. related to CSS imports
    const virtualConsole = new jsdom.VirtualConsole();
    const dom = new JSDOM(body, {virtualConsole});

    let result;
    const matches = dom.window.document.querySelectorAll(selector);

    if (matches.length) {
        const allResults = [];
        for (let i = 0, ii = matches.length; i < ii; i++) {
            result = matcher(matches[i].textContent, matcherData);
            if (null === result) {
                return null;
            }
            allResults.push('\n      * ' + result);
            if (matches.length > 1) {
                result = `None of ${matches.length} nodes matching the selector matches the assertion:` +
                    allResults.join('');
            }
        }
    } else {
        result = 'Does not match anything in the document';
    }

    return `Selector “${selector}”: ${result}`;
}

module.exports = {supports, check};
