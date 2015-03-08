require('chai').should();

var grammar = require('../etc/grammar');
var parse = require('../lib/precedence-parser').parse.bind(undefined, grammar.operators);
var putils = require('../lib/parser-utils');

function structure (nodes) {
    var result = parse(nodes);
    if (result.error) {
        return 'error';
    } else {
        return putils.structureString(result);
    }
}

/* global describe, it */

describe('Precedence Parser', function () {

    it ('Should parse an addition', function () {
        structure([
            {
                type: 'const.identifier',
                value: 'a'
            },
            {
                type: 'operator.plus',
                value: '+'
            },
            {
                type: 'const.identifier',
                value: 'b'
            }
        ]).should.equal('(operation (operator.plus +) (const.identifier a) (const.identifier b))');
    });

    it ('Should parse an addition and a multiplication', function () {
        structure([
            {
                type: 'const.identifier',
                value: 'a'
            },
            {
                type: 'operator.plus',
                value: '+'
            },
            {
                type: 'const.identifier',
                value: 'b'
            },
            {
                type: 'operator.mul',
                value: '*'
            },
            {
                type: 'const.identifier',
                value: 'c'
            }
        ]).should.equal('(operation (operator.plus +) (const.identifier a) (operation (operator.mul *) (const.identifier b) (const.identifier c)))');
    });

    it ('Should parse a right associative operator', function () {
        structure([
            {
                type: 'const.identifier',
                value: 'a'
            },
            {
                type: 'operator.equal',
                value: '='
            },
            {
                type: 'const.identifier',
                value: 'b'
            },
            {
                type: 'operator.equal',
                value: '='
            },
            {
                type: 'const.identifier',
                value: 'c'
            }
        ]).should.equal('(operation (operator.equal =) (const.identifier a) (operation (operator.equal =) (const.identifier b) (const.identifier c)))');
    });

    it ('Should parse a left- and a right- associative operator', function () {
        structure([
            {
                type: 'const.identifier',
                value: 'a'
            },
            {
                type: 'operator.equal',
                value: '='
            },
            {
                type: 'const.identifier',
                value: 'b'
            },
            {
                type: 'operator.mul',
                value: '*'
            },
            {
                type: 'const.identifier',
                value: 'c'
            }
        ]).should.equal('(operation (operator.equal =) (const.identifier a) (operation (operator.mul *) (const.identifier b) (const.identifier c)))');
    });
});
