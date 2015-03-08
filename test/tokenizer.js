/* global describe, it */

require('chai').should();

var grammar = require('../etc/grammar');
var tokenize = require('../lib/tokenizer').tokenize.bind(undefined, grammar.tokens);

describe('Tokenizer', function () {

    it('should recognize a single token', function () {
        tokenize('::', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        }]);
    });

    it('should recognize 2 tokens', function () {
        tokenize('::->', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        },{
            type: 'operator.rightArrow',
            value: '->',
            row: 0,
            col: 2
        }]);
    });

    it('should ignore whitespace', function () {
        tokenize(':: ->', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        },{
            type: 'operator.rightArrow',
            value: '->',
            row: 0,
            col: 3
        }]);
    });

    it('should ignore whitespace - newlines', function () {
        tokenize('::\n->', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        },{
            type: 'operator.rightArrow',
            value: '->',
            row: 1,
            col: 0
        }]);
    });

    it('should ignore whitespace - several newlines', function () {
        tokenize('::\n\n ->', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        },{
            type: 'operator.rightArrow',
            value: '->',
            row: 2,
            col: 1
        }]);
    });

    it('should ignore whitespace - several newlines and tabs', function () {
        tokenize('::\n\n \t\t->', 0, 0).should.deep.equal([{
            type: 'operator.doubleColon',
            value: '::',
            row: 0,
            col: 0
        },{
            type: 'operator.rightArrow',
            value: '->',
            row: 2,
            col: 3
        }]);
    });

    it('should recognize a float', function () {
        tokenize('3.14', 0, 0).should.deep.equal([{
            type: 'const.float',
            value: '3.14',
            row: 0,
            col: 0
        }]);
    });

    it('should recognize an int', function () {
        tokenize('3', 0, 0).should.deep.equal([{
            type: 'const.int',
            value: '3',
            row: 0,
            col: 0
        }]);
    });

    it('should recognize an int followed by a float', function () {
        tokenize('3 3.14', 0, 0).should.deep.equal([{
            type: 'const.int',
            value: '3',
            row: 0,
            col: 0
        },{
            type: 'const.float',
            value: '3.14',
            row: 0,
            col: 2
        }]);
    });

    it('should recognize a float followe by an int', function () {
        tokenize('3.14 3', 0, 0).should.deep.equal([{
            type: 'const.float',
            value: '3.14',
            row: 0,
            col: 0
        },{
            type: 'const.int',
            value: '3',
            row: 0,
            col: 5
        }]);
    });

    it('should recognize an identifier', function () {
        tokenize('3quatorze', 0, 0).should.deep.equal([{
            type: 'const.identifier',
            value: '3quatorze',
            row: 0,
            col: 0
        }]);
    });

    it('should recognize an int followed by an identifier', function () {
        tokenize('3 quatorze', 0, 0).should.deep.equal([{
            type: 'const.int',
            value: '3',
            row: 0,
            col: 0
        },{
            type: 'const.identifier',
            value: 'quatorze',
            row: 0,
            col: 2
        }]);
    });

    it('should correctly interpret a dot as an operator when it is not part of a float', function () {
        tokenize('3.quatorze', 0, 0).should.deep.equal([{
            type: 'const.int',
            value: '3',
            row: 0,
            col: 0
        },{
            type: 'operator.dot',
            value: '.',
            row: 0,
            col: 1
        },{
            type: 'const.identifier',
            value: 'quatorze',
            row: 0,
            col: 2
        }]);
    });

    it('should fail on unknown stuff', function () {
        tokenize('hi()', 0, 0).should.have.property('error').and.include({
            row: 0,
            col: 2
        });
    });
});
