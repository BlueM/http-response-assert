const rawHandler = require('../../handlers/raw-handler');

const html = '<html><body>Foo</body></html>';

describe('Raw handler', () => {
    it('should perform a check on raw content', () => {
        expect(rawHandler.check({}, 200, html, ['contains', '<body>Foo']))
            .toBe(null);
    });

    it('should perform a check on raw content when using extra word "content" for the action', () => {
        expect(rawHandler.check({}, 200, html, ['Content', 'contains', '<body>Foo']))
            .toBe(null);
    });

    it('should perform a check on raw content when using extra word "body" for the action', () => {
        expect(rawHandler.check({}, 200, html, ['body', 'contains', '<body>Foo']))
            .toBe(null);
    });

    it('should report a failing check', () => {
        expect(rawHandler.check({}, 200, html, ['contains', '<body>bar']))
            .toBe(`Raw body: Expected “${html}” to contain “<body>bar”`);
    });
});
