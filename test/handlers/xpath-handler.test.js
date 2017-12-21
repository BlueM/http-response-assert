const xPathHandler =  require('../../handlers/xpath-handler');

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

describe('XPath handler', () => {
    it('should throw an error if the matcher data consists of < 2 items', () => {
        expect(
            () => xPathHandler({}, '', html, ['//li/strong'])
        ).toThrowError('Invalid assertion');
    });

    it('should report a non-matching XPath expression', () => {
        expect(
            xPathHandler({}, '', html, ['//li/strong', 'contains', 'hello'])
        ).toBe('XPath “//li/strong”: No node matches the XPath expression');
    });

    it('should report a matching XPath expression failing an assertion', () => {
        expect(
            xPathHandler({}, '', html, ['//p', 'is', 'No such text'])
        ).toBe('XPath “//p”: None of 1 nodes matching the XPath expression matches the assertion:\n' +
            '      * Expected “Text in paragraph” to equal “No such text”');
    });

    it('should return null for a matching XPath expression and successful assertion', () => {
        expect(
            xPathHandler({}, '', html, ['//p', 'is', 'Text in paragraph'])
        ).toBe(null);
    });
});
