const codeHandler = require('../../handlers/code-handler');

describe('Code handler', () => {
    it('should return an error message if code is not as expected', () => {
        expect(codeHandler({}, 404, '', ['is', '200'])).toBe('Expected status code 200, got 404');
    });

    it('should return null if code is as expected', () => {
        expect(codeHandler({}, 302, '', ['is', '302'])).toBe(null);
    });
});
