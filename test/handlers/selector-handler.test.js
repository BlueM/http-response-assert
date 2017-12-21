const selectorHandler = require('../../handlers/selector-handler');

const html = `<html>
<head>
<title>Selector test</title>
</head>
<body></body>
<p>Text in paragraph</p>
<ul>
<li>List item #1</li>
<li>List item #2</li>
<li>List item #3, which contains <a href="#">a link</a>.</li>
</ul>
</html>`;

describe('Selector handler', () => {
    it('should throw an error if the matcher data consists of < 2 items', () => {
        expect(() => selectorHandler({}, 200, '', ['contains'])).toThrow();
    });

    it('should return an error message if a selector does not match anything', () => {
        expect(selectorHandler({}, 200, html, ['li strong', 'contains']))
            .toEqual('Selector “li strong”: Does not match anything in the document');
    });

    it('should return an error message if a selector matches, but assertion fails', () => {
        expect(selectorHandler({}, 200, html, ['li a', 'contains', 'blah']))
            .toEqual('Selector “li a”: Expected “a link” to contain “blah”');
    });

    it('should return null if a selector matches and assertion succeeds', () => {
        expect(selectorHandler({}, 200, html, ['li a', 'is', 'a link'])).toBe(null);
    });
});
