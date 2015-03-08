require('chai').should();

var parser = require('../lib/parser');
var putils = require('../lib/parser-utils');

function firstPassStructure (str, withPos) {
    var result = parser.firstPass(str);
    if (result.error) {
        return 'error';
    } else {
        return putils.structureString(result.expression, withPos);
    }
}

function secondPassStructure (str, withPos) {
    var result = parser.secondPass(str);
    if (result.error) {
        return 'error';
    } else {
        return putils.structureString(result, withPos);
    }
}

/* global describe, it */

describe('Parser', function () {
    describe('First Pass', function () {

        it('should parse a string', function () {
            firstPassStructure('"str"').should.equal('(string str)');
        });

        it('should parse a quoted string', function () {
            firstPassStructure('"s\\"tr"').should.equal('(string s"tr)');
        });

        it('should identify raw text', function () {
            firstPassStructure('hi', true).should.equal('([0:0] raw hi)');
        });

        it('should identify text inside parens', function () {
            firstPassStructure('(hi)', true).should.equal('([0:0] group.paren ([0:1] raw hi))');
        });

        it('should count lines', function () {
            firstPassStructure('(hi\n (world))', true).should.equal('([0:0] group.paren ([0:1] raw hi\n ) ([1:1] group.paren ([1:2] raw world)))');
        });

        it('should count multiple lines', function () {
            firstPassStructure('(hi\n\n (world))', true).should.equal('([0:0] group.paren ([0:1] raw hi\n\n ) ([2:1] group.paren ([2:2] raw world)))');
        });

        it('should count nested lines', function () {
            firstPassStructure('(hi\n\n (\nworld) hey)', true).should.equal(
                '([0:0] group.paren ([0:1] raw hi\n\n ) ([2:1] group.paren ([2:2] raw \nworld)) ([3:6] raw  hey))'
            );
        });

        it('should identify text inside 2 parens', function () {
            firstPassStructure('((hi))').should.equal('(group.paren (group.paren (raw hi)))');
        });

        it('should recognize square brackets groups', function () {
            firstPassStructure('[hi]').should.equal('(group.square (raw hi))');
        });

        it('should recognize curly brackets groups', function () {
            firstPassStructure('{hi}').should.equal('(group.curly (raw hi))');
        });

        it('should allow arbitrary nesting of groups', function () {
            firstPassStructure('[{(hi)}]', true).should.equal('([0:0] group.square ([0:1] group.curly ([0:2] group.paren ([0:3] raw hi))))');
        });

        it('should parse stuff starting with raw string', function () {
            firstPassStructure('hello (world)').should.equal('(raw hello ) (group.paren (raw world))');
        });

        it('should yell if whole input not parsed', function () {
            firstPassStructure('hello (world) (bob').should.equal('error');
        });
    });

    describe('Second Pass', function () {
        it('should identify identifier', function () {
            secondPassStructure('hi').should.equal('(const.identifier hi)');
        });

        it('should identify identifiers', function () {
            secondPassStructure('hello world').should.equal('(const.identifier hello) (const.identifier world)');
        });

        it('should identify nested stuff', function () {
            secondPassStructure('(sum 1 2)').should.equal('(group.paren (const.identifier sum) (const.int 1) (const.int 2))');
        });

        it('should identify deeply nested stuff', function () {
            secondPassStructure('[blah (sum 1 2.5)]').should.equal('(group.square (const.identifier blah) (group.paren (const.identifier sum) (const.int 1) (const.float 2.5)))');
        });
    });
});
