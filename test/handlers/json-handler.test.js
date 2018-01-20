const jsonHandler = require('../../handlers/json-handler');

const json = JSON.stringify(
    {
        foo: 'bar',
        arr: [
            2,
            {abc: 'def'},
            'Hello world',
        ]
    }
);

describe('Json handler', function () {
    it('should throw an error if body cannot be JSON-decoded', () => {
        expect(jsonHandler.check({}, 200, 'Hello world', [])).toEqual('Could not JSON-decode response body');
    });

    it('should return an error message if the JSON path matches, but the assertion fails', () => {
        expect(jsonHandler.check({}, 200, json, ['/foo', 'contains', 'failure']))
            .toEqual('Check for JSON pointer “/foo”: Expected “bar” to contain “failure”');
    });

    it('should return null if the JSON path matches and the assertion succeeds', () => {
        expect(jsonHandler.check({}, 200, json, ['/arr/1/abc', 'is', 'def'])).toBe(null);
    });
});
