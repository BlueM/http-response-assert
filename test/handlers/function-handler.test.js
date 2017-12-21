const functionHandler = require('../../handlers/function-handler');

describe('Function handler', () => {
    it('should return the given function’s return value', () => {
        expect(
            functionHandler(
                {'content-type': 'text/plain'},
                200,
                'OK',
                (headers, statusCode, body) => {
                    return `${headers['content-type']} / ${statusCode} / ${body}`;
                }
            )
        ).toBe('text/plain / 200 / OK');
    });
});
