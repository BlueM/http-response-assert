const debug = require('debug')('@bluem/http-response-assert');
const debugReq = require('debug')('@bluem/http-response-assert:network:request');
const debugResp = require('debug')('@bluem/http-response-assert:network:response');
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
     *                send with request), "concurrency" (number of concurrent requests to send,
     *                defaults to 1), "delay" (number of milliseconds to wait before sending
     *                the next request, defaults to 100)
     */
    constructor(options = {}) {
        this.checks = [];
        this.results = [];
        this.agent = options.agent || 'http-response-assert';
        this.timeout = +options.timeout > 0 ? +options.timeout : 3000;
        this.running = 0;
        this.concurrency = +options.concurrency > 1 ? +options.concurrency : 1;
        this.delay = +options.delay >= 0 ? +options.delay : 100;
        if (options.handlerDir) {
            this.loadExtraHandlers(options.handlerDir);
        }
    }

    addTest(url, assertions, req) {
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

        req.time = true;

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

        const exec = () => {
            setTimeout(
                () => this.executeNextCheck(resolve, reject),
                this.checks.length ? this.delay : 0
            );
        };

        if (this.checks.length) {
            let check = this.checks.shift();
            this.running ++;
            const requestTitle = check.request.title || this.createTestTitle(check.request);
            let p = this.performTest(check.request, check.assertions);
            p.then((resolveValue) => {
                this.running --;
                resolveValue.title = requestTitle;
                this.results.push(resolveValue);
                exec();
            })
            .catch((rejectValue) => {
                this.running --;
                rejectValue.title = requestTitle;
                this.results.push(rejectValue);
                exec();
            });

            if (this.running < this.concurrency) {
                exec();
            }
        } else if (0 === this.running) {
            const failureMessages = this.results.filter(result => !result.success).map(result => result.summary);
            const failed = failureMessages.length;
            const succeeded = this.results.length - failed;

            let summary = `${succeeded} test(s) passed, ${failed} test(s) failed`;
            if (failed) {
                reject({results: this.results, summary: summary + ':\n' + failureMessages.join('\n')});
            } else {
                resolve({results: this.results, summary});
            }
        }
    }

    createTestTitle(request) {
        // Preliminary implementation with room for improvement: include info
        // on response body, form data, ...
        return `${request.method} ${request.uri}`;
    }

    performTest(req, assertions) {
        return new Promise((resolve, reject) => {

            debugReq('Request: %s %s', req.method, req.uri);
            const time = Date.now();
            request(
                req,
                (error, response, body) => {
                    debugResp('Response: %s %s', req.method, req.uri);

                    const resolveRejectValue = {
                        success: false,
                        timingStart: (response && response.timingStart) ? response.timingStart : time,
                        timings: (response && response.timings) ? response.timings : null,
                        timingPhases: (response && response.timingPhases) ? response.timingPhases : null,
                    };

                    if (error) {
                        let errString = `${req.method} ${req.uri} (${error} / configured timeout: ${req.timeout})`;
                        debug(`Execution failed: ${errString} -- ${req.uri}`);
                        resolveRejectValue.summary = `Execution failed: ${errString}`;
                        resolveRejectValue.passed = [];
                        resolveRejectValue.failed = assertions;
                        reject(resolveRejectValue);
                        return;
                    }

                    const results = this.getAssertionsResult(assertions, response, body);
                    resolveRejectValue.passed = results.passed;
                    resolveRejectValue.failed = results.failed;

                    if (results.failed.length) {
                        resolveRejectValue.summary = `${results.failed.length} assertion(s) failed for ${req.method} ${req.uri}\n` +
                                                     `   * ${results.failed.join('\n   * ')}`;
                        reject(resolveRejectValue);
                    } else {
                        resolveRejectValue.success = true;
                        resolveRejectValue.summary = `Passed ${results.passed.length} assertion(s)`;
                        resolve(resolveRejectValue);
                    }
                }
            );
        });
    }

    getAssertionsResult(assertions, response, body) {
        let testResults = {passed: [], failed: []};
        assertions.forEach((assertion) => {
            let assertionData;
            let matcher;

            if ('function' === typeof assertion) {
                assertionData = assertion;
                matcher = functionHandler;
            } else {
                try {
                    assertionData = split(assertion.trim());
                } catch (e) {
                    throw new Error(`Error encountered: “${e.message}”\nLine:\n${assertion.trim()}\n`);
                    return;
                }
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
                    testResults.failed.push(failure);
                } else {
                    testResults.passed.push(assertion);
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
