const textHandler = require('../../handlers/text-handler');

const htmlContentType = {'content-type': 'text/html; charset=utf-8'};
const cssContentType = {'content-type': 'text/css; charset=utf-8'};
const jsContentType1 = {'content-type': 'application/javascript'};
const jsContentType2 = {'content-type': 'text/javascript'};

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

const css = `
.some-class {
    margin-top: 2em;
    font-family: Helvetica;
}
`;

const js = `
function myFunc() {
    return 'Hello world';
}
`;

describe('Text handler', () => {
    it('should throw an error when used with an unexpected MIME type', () => {
        expect(() => textHandler.check({'content-type': 'application/pdf'}, 200, '', ['contains', 'foo']))
            .toThrowError('Unsupported MIME type: application/pdf');
    });

    it('should find text in HTML text nodes', () => {
        expect(textHandler.check(htmlContentType, 200, html, ['contains', 'in paragraph']))
            .toBe(null);
    });

    it('should not find text in HTML attributes or HTML comments', () => {
        expect(textHandler.check(htmlContentType, 200, html, ['does not contain', 'findmenot']))
            .toBe(null);
    });

    it('should not find HTML attributes', () => {
        expect(textHandler.check(htmlContentType, 200, html, ['does not contain', 'class']))
            .toBe(null);
    });

    it('should find everywhere in JS for application/javascript', () => {
        expect(textHandler.check(jsContentType1, 200, js, ['contains', 'function myFunc']))
            .toBe(null);
    });

    it('should find everywhere in JS for text/javascript', () => {
        expect(textHandler.check(jsContentType2, 200, js, ['contains', 'Hello world']))
            .toBe(null);
    });

    it('should find everywhere in CSS', () => {
        expect(textHandler.check(cssContentType, 200, css, ['contains', 'some-class']))
            .toBe(null);
        expect(textHandler.check(cssContentType, 200, css, ['contains', 'margin-top']))
            .toBe(null);
        expect(textHandler.check(cssContentType, 200, css, ['contains', 'Helvetica']))
            .toBe(null);
    });
});
