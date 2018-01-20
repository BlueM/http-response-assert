const headerHandler = require('../../handlers/header-handler');

describe('Header handler', () => {
    it('should throw an exception if the matcher data consists of less than 2 items', () => {
        expect(() => headerHandler.check({}, 200, '', ['foo'])).toThrow();
    });

    it('should return null if an assertion succeeds', () => {
        expect(headerHandler.check({'content-type': 'text/html'}, 200, '', ['Content-Type', 'starts', 'with', 'text/html'])).toBe(null);
    });
});