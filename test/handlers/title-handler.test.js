const titleHandler =  require('../../handlers/title-handler');

const html = `<html>
<head>
<title>The page title</title>
</head>
<body>
<p>Hello world</p>
</body>
</html>`;

describe('Title handler', () => {
    it('should report a matching title', () => {
        expect(
            titleHandler.check({}, '', html, ['is', 'The page title'])
        ).toBe(null);
    });

    it('should report a failed assertion on the title', () => {
        expect(
            titleHandler.check({}, '', html, ['is', 'Other title'])
        ).toBe('Title: None of 1 nodes matching the XPath expression matches the assertion:\n' +
            '      * Expected “The page title” to equal “Other title”');
    });
});
