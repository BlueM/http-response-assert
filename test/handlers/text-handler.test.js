const textHandler = require('../../handlers/text-handler');

const htmlContentTypeWithoutCharset = {'content-type': 'text/html'};
const htmlContentTypeWithCharset = {'content-type': 'text/html; charset=utf-8'};
const plaintextContentType = {'content-type': 'text/plain'};

const html = `<html>
<head>
<title>Foobar</title>
</head>
<body class="findmenot"></body>
<!-- findmenot -->
<p>Text in paragraph</p>
<script>
let foo = 'Text inside script';
</script>
</html>`;

const plaintext = `Hello world
This is <not> a tag`;

describe('Text handler', () => {
    it('should return body as-is when the MIME type does not need special handling', () => {
        expect(textHandler.check(plaintextContentType, 200, plaintext, ['contains', '<not> a tag'])).toBe(null);
    });

    it('should find text in HTML text nodes', () => {
        expect(textHandler.check(htmlContentTypeWithoutCharset, 200, html, ['contains', 'in paragraph']))
            .toBe(null);
    });

    it('should not find text in HTML attributes or HTML comments', () => {
        expect(textHandler.check(htmlContentTypeWithCharset, 200, html, ['does not contain', 'findmenot']))
            .toBe(null);
    });

    it('should not find HTML attributes', () => {
        expect(textHandler.check(htmlContentTypeWithCharset, 200, html, ['does not contain', 'class']))
            .toBe(null);
    });
});
