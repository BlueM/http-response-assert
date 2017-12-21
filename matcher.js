const UnexpectedUndefinedError = require('./errors/unexpected-undefined-error');

module.exports = function (actualValue, matcherData) {

    // is not set
    // does not exist
    // not exists
    // exists not
    // is not present
    if (['is not set', 'does not exist', 'not exists', 'exists not', 'is not present'].indexOf(matcherData.join(' ').toLowerCase()) > -1) {
        if (actualValue !== undefined) {
            return 'Expected to be not set';
        }
        return null;
    }

    // starts with
    if (['starts with'].indexOf(matcherData.slice(0, 2).join(' ').toLowerCase()) > -1) {
        if (0 !== actualValue.indexOf(matcherData[2])) {
            return `Expected “${actualValue}” to start with “${matcherData[2]}”`;
        }
        return null;
    }

    // does not contain
    // contains not
    // not contains
    if (['does not contain', 'contains not', 'not contains'].indexOf(matcherData.slice(0, -1).join(' ').toLowerCase()) > -1) {
        const value = matcherData.pop();
        if (-1 < actualValue.indexOf(value)) {
            return `Expected “${actualValue}” to not contain “${value}”`;
        }
        return null;
    }

    // contains
    if (['contains'].indexOf(matcherData[0].toLowerCase()) > -1) {
        if (undefined === actualValue) {
            throw new UnexpectedUndefinedError('Undefined value');
        }
        if (-1 === actualValue.indexOf(matcherData[1])) {
            return `Expected “${actualValue}” to contain “${matcherData[1]}”`;
        }
        return null;
    }

    // is set
    // exists
    // is present
    if (['is set', 'exists', 'is present'].indexOf(matcherData.join(' ').toLowerCase()) > -1) {
        if (actualValue === undefined) {
            return 'Expected to exist';
        }
        return null;
    }

    // is
    // equals
    if (['is', 'equals'].indexOf(matcherData[0].toLowerCase()) > -1) {
        if (actualValue !== matcherData[1]) {
            return `Expected “${actualValue}” to equal “${matcherData[1]}”`;
        }
        return null;
    }

    throw new Error('Do not know what to do with matcher data: ' + matcherData.join(' '));
};
