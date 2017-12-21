const debug = require('debug')('http-response-assert');
const request = require('request');
const split = require('argv-split');

const headerHandler = require('./handlers/header-handler.js');
const statusCodeHandler = require('./handlers/code-handler.js');
const textHandler = require('./handlers/text-handler.js');
const functionHandler = require('./handlers/function-handler.js');
const selectorHandler = require('./handlers/selector-handler');
const xpathHandler = require('./handlers/xpath-handler');
const jsonPointerHandler = require('./handlers/json-handler');

module.exports = class {

    constructor() {
        this.succeeded = 0;
        this.alerts = [];
        this.checks = [];
        this.timeout = 3000; // In milliseconds
        this.agent = 'http-response-assert';
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
            throw new Error('Assertions must be given as an array');
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

            debug('Request: %s', req.uri);

            request(
                req,
                (error, response, body) => {
                    debug('Got response for: %s', req.uri);

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

    getHandler(matcherString) {
        let matcher;

        switch (matcherString.toLowerCase()) {
            case 'header':
                matcher = headerHandler;
                break;

            case 'code':
                matcher = statusCodeHandler;
                break;

            case 'css':
            case 'selector':
                matcher = selectorHandler;
                break;

            case 'xpath':
                matcher = xpathHandler;
                break;

            case 'json':
                matcher = jsonPointerHandler;
                break;

            case 'text':
                matcher = textHandler;
                break;
        }

        debug('Matcher: %o', matcher);

        return matcher;
    }
};
