const matcher = require('../matcher');

describe('Matcher', () => {

    describe('identifies an undefined value', () => {
        ['is not set', 'not exists', 'does not exist', 'is not present'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher(undefined, string.split(' '))).toBeNull();
            });
        });
    });

    describe('reports a defined value which is supposed to be undefined', () => {
        ['is not set', 'not exists', 'does not exist', 'is not present'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('', string.split(' '))).toBe('Expected to be not set');
            });
        });
    });

    describe('identifies an exact match', () => {
        ['is', 'equals'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Blah', [string, 'Blah'])).toBeNull();
            });
        });
    });

    describe('reports a not matching exact match', () => {
        ['is', 'equals'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('foobar', [string, 'Blah'])).toBe('Expected “foobar” to equal “Blah”');
            });
        });
    });

    describe('identifies a contained array item', () => {
        ['contains'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher(['a', 'b', 'c'], [string, 'b'])).toBeNull();
            });
        });
    });

    describe('identifies a substring match', () => {
        ['contains'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', [string, 'ooba'])).toBeNull();
            });
        });
    });

    describe('reports a not matching substring match', () => {
        ['contains'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', [string, 'FooBar'])).toBe('Expected “Foobar” to contain “FooBar”');
            });
        });
    });

    describe('can match against a RegEx', () => {
        ['matches'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Hello world', [string, '^Hel+o +[wW]orld$'])).toBeNull();
            });
        });
    });

    describe('can match against a RegEx which is supposed to not match', () => {
        ['matches not', 'not matches', 'does not match'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Hello world', [string, '^Hel+o +World$'])).toBeNull();
            });
        });
    });

    describe('reports a non-matching RegEx which should have matched', () => {
        ['matches'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Hello world', [string, '^Hel+o World$'])).toBe('Expected “Hello world” to match /^Hel+o World$/');
            });
        });
    });

    describe('reports a matching RegEx which should not have matched', () => {
        ['matches not', 'not matches', 'does not match'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Hello world', [string, '^Hel+o world$'])).toBe('Expected “Hello world” to not match /^Hel+o world$/');
            });
        });
    });

    describe('identifies absence of forbidden substring', () => {
        ['not contains', 'does not contain', 'contains not'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', string.split(' ').concat('Bar'))).toBeNull();
            });
        });
    });

    describe('identifies absence of forbidden substring', () => {
        ['not contains', 'does not contain', 'contains not'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', string.split(' ').concat('bar'))).toBe('Expected “Foobar” to not contain “bar”');
            });
        });
    });

    describe('identifies a start-of-string match', () => {
        ['starts with'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', string.split(' ').concat('Foo'))).toBeNull();
            });
        });
    });

    describe('reports a not matching start-of-string match', () => {
        ['starts with'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('Foobar', string.split(' ').concat('foo'))).toBe('Expected “Foobar” to start with “foo”');
            });
        });
    });

    describe('identifies a defined value', () => {
        ['is set', 'exists', 'is present'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher('', string.split(' '))).toBeNull();
            });
        });
    });

    describe('reports an undefined value expected to be defined', () => {
        ['is set', 'exists', 'is present'].forEach((string) => {
            it(`when called with “${string}”`, () => {
                expect(matcher(undefined, string.split(' '))).toBe('Expected to exist');
            });
        });
    });

    it('should throw an error if the type of matching is not recognized', () => {
        expect(() => matcher('abc', ['foobar'])).toThrow();
    });
});
