const UnexpectedUndefinedError= require('../errors/unexpected-undefined-error');
const matcher = require('../matcher');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

module.exports = function(xPath, body, matcherData) {
    // Add a virtual console for suppressing warnings, e.g. related to CSS imports
    const virtualConsole = new jsdom.VirtualConsole();
    const dom = new JSDOM(body, {virtualConsole});

    const iterator = dom.window.document.evaluate(
        xPath,
        dom.window.document.documentElement,
        null,
        dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
    );

    const allResults = [];
    let result;
    let count = 0;
    let node = iterator.iterateNext();

    while (node) {
        result = matcher(node.textContent, matcherData);
        if (null === result) {
            return null;
        }
        allResults.push('\n      * ' + result);
        count ++;
        node = iterator.iterateNext();
    }

    if (count) {
        result = `None of ${count} nodes matching the XPath expression matches the assertion:` +
            allResults.join('');
    } else if (!result) {
        try {
            result = matcher(undefined, matcherData);
            if (null === result) {
                return null;
            }
        } catch (e) {
            if (e instanceof UnexpectedUndefinedError) {
                result = 'No node matches the XPath expression';
            } else {
                result = e.message;
            }
        }
    }

    return result;
};

