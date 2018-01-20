const HttpResponseAssert = require('../index.js');

describe('http-response-assert', () => {

    it('initially has no checks', () => {
        const hra = new HttpResponseAssert();
        expect(hra.checks).toEqual([]);
    });

    describe('should reject checks', () => {
        it('if the assertions are not an array', () => {
            const hra = new HttpResponseAssert();
            expect(() => hra.addCheck('http://example.com'))
                .toThrowError('Assertions must be given as an array');
        });

        it('if the assertions are an empty array', () => {
            const hra = new HttpResponseAssert();
            expect(() => hra.addCheck('http://example.com', []))
                .toThrowError('No assertions are defined for GET request for http://example.com');
        });
    });

    describe('should accept checks', () => {
        it('when only a URL is given, treat as GET request with default timeout', () => {
            const hra = new HttpResponseAssert();
            hra.addCheck('http://example.com', ['xx']);
            expect(hra.checks).toEqual([
                {
                    assertions: ['xx'],
                    request: {
                        headers: {'User-Agent': 'http-response-assert'},
                        method: 'GET',
                        timeout: 3000,
                        uri: 'http://example.com'
                    }
                }
            ]);
        });

        it('with a custom timeout', () => {
            const hra = new HttpResponseAssert();
            hra.addCheck('http://example.com', ['xx'], {timeout: 5000});
            expect(hra.checks[0].request.timeout).toBe(5000);
        });
    });

    describe('should run returning', () => {
        it('should return a rejected promise if run method is called with no checks defined', () => {
            const hra = new HttpResponseAssert();
            hra.run()
                .catch((err) => {
                    expect(err).toEqual('No checks have been defined.');
                });
        });

        it('should return a promise of a success message, if all checks succeed', () => {
            const req = {uri: 'http://example.com'};
            const hra = new HttpResponseAssert();

            // Mock the actual checking
            hra.performCheck = (req, assertions) => {
                expect(req).toEqual(req);
                expect(assertions).toEqual(['Foo']);
                return Promise.resolve();
            };
            hra.checks = [
                {request: req, assertions: ['Foo']}
            ];
            hra.run()
                .then((msg) => {
                    expect(msg).toBe('1 URL successful, 0 failures')
                });
        });

        it('should return a promise of a failure message, if a checks fails', () => {
            const req = {uri: 'http://example.com'};
            const hra = new HttpResponseAssert();

            // Mock the actual checking
            hra.performCheck = () => {
                return Promise.reject('Failure');
            };
            hra.checks = [
                {request: req, assertions: ['Foo']}
            ];
            hra.run()
                .catch((msg) => {
                    expect(msg).toBe('0 URL successful, 1 failures:\nFailure')
                });
        });
    });
});
