const debug = require('debug')('http-response-assert:function-handler');

/**
 * @todo
 *
 * @param headers
 * @param statusCode
 * @param body
 * @param func
 *
 * @returns {*}
 */
module.exports = function (headers, statusCode, body, func) {

    debug('matcherData: %o', func);

    let result;

    try {
        result = func(headers, statusCode, body);
    } catch (e) {
        result = `Error in assertion function: ${e.message}`;
    }

    return result;
};
