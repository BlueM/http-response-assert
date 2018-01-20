const debug = require('debug')('@bluem/http-response-assert');
const request = require('request');
const split = require('argv-split');
const requireDirectory = require('require-directory');
const handlers = requireDirectory(module, './handlers', {exclude: /function-handler\.js$/});
const functionHandler = require('./handlers/function-handler.js');

module.exports = class {

    /**
     * Create object with the given options
     *
     * @param options Object with 0 or more of properties: "handlerDir" (filesystem path to a
     *                directory containing additional handler(s)), "timeout" (Request timeout
     *                time in milliseconds, defaults to 3000), "agent" (user-agent string to
     *                send with request)
     */
    constructor(options = {}) {
        this.succeeded = 0;
        this.alerts = [];
        this.checks = [];
        this.agent = options.agent || 'http-response-assert';
        this.timeout = +options.timeout > 0 ? +options.timeout : 3000;
        if (options.handlerDir) {
            this.loadExtraHandlers(options.handlerDir);
        }
    }

    addCheck(url, assertions, req) {

        if ('string' === typeof req) {
            req = {method: req};
        } else if (!req) {
            req = {method: 'GET'};
        } else if (!req.method) {
            req.method = 'GET';
        }

        if (!req.headers) {
            req.headers = {};
        }
        req.headers['User-Agent'] = this.agent;
        req.uri = url;

        if (!req.timeout || +req.timeout <= 1) {
            req.timeout = this.timeout;
        }

        if (!Array.isArray(assertions)) {
            throw new Error(`Assertions must be given as an array (error caused when adding checks for ${req.method} request to ${req.uri})`);
        } else if (!assertions.length) {
            throw new Error(`No assertions are defined for ${req.method} request for ${req.uri}`);
        }

        this.checks.push({request: req, assertions});
    }

    /**
     * Triggers execution of the checks created using addCheck(), and returns a Promise
     *
     * @returns Promise
     */
    run() {
        if (!this.checks.length) {
            return Promise.reject('No checks have been defined.');
        }

        return new Promise((resolve, reject) => {
            this.executeNextCheck(resolve, reject);
        });
    }

    executeNextCheck(resolve, reject) {
        if (this.checks.length) {
            let check = this.checks.shift();
            let p = this.performCheck(check.request, check.assertions);
            p.then(() => {
                this.succeeded++;
                this.executeNextCheck(resolve, reject);
            })
            .catch((message) => {
                this.alerts.push(message);
                this.executeNextCheck(resolve, reject);
            });
        } else {
            let astr = `${this.succeeded} ${this.succeeded > 1 ? 'URLs' : 'URL'} successful, ${this.alerts.length} failures`;
            if (this.alerts.length) {
                reject(astr + ':\n' + this.alerts.join('\n'));
            } else {
                resolve(astr);
            }
        }
    }

    performCheck(req, assertions) {
        return new Promise((resolve, reject) => {

            debug('Request: %s %s', req.method, req.uri);

            request(
                req,
                (error, response, body) => {
                    debug('Response: %s %s', req.method, req.uri);

                    if (error) {
                        let errString = `${req.method} ${req.uri} (${error})`;
                        debug(`Execution failed: ${errString} -- ${req.uri}`);
                        reject('Execution failed: ' + errString);
                        return;
                    }

                    const testResults = this.getAssertionsResult(assertions, response, body);
                    if (testResults.length) {
                        reject(
                            `${testResults.length} assertion(s) failed for ${req.method} ${req.uri}\n` +
                            `   * ${testResults.join('\n   * ')}`
                        );
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    getAssertionsResult(assertions, response, body) {
        let testResults = [];
        assertions.forEach((assertion) => {
            let assertionData;
            let matcher;

            if ('function' === typeof assertion) {
                assertionData = assertion;
                matcher = functionHandler;
            } else {
                assertionData = split(assertion.trim());
                matcher = this.getHandler(assertionData.shift());
            }

            if (matcher) {
                const failure = matcher(
                    response.headers,
                    response.statusCode,
                    body,
                    assertionData
                );
                if (failure) {
                    testResults.push(failure);
                }
            } else {
                throw new Error(`No matcher found for:\n  ${assertion}`);
            }
        });
        return testResults;
    }

    /**
     * Returns the first handler object which declares itself capable of
     * handling an assertion of the given type.
     *
     * @param matcherString
     * @returns {undefined|Function}
     */
    getHandler(matcherString) {
        const type = matcherString.toLowerCase();
        for (const handler in handlers) {
            if (handlers[handler].supports(type)) {
                debug('Handler: %s', handler);
                return handlers[handler].check;
            }
        }
    }

    /**
     * Loads assertion handlers from the directory given as argument
     *
     * @param dir Directory path
     */
    loadExtraHandlers(dir) {
        let extraHandlers;
        try {
            extraHandlers = requireDirectory(module, dir);
        } catch (e) {
            throw new Error(`Directory ${dir} is invalid`);
        }
        for (const handler in extraHandlers) {
            handlers[handler] = extraHandlers[handler];
        }
    }
};
