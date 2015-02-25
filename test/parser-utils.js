require('chai').should();

var putils = require('../lib/parser-utils');

/* global describe, it */

describe('Parser Utils', function () {
    describe('structureString', function () {
        it('should make a concise representation of a simple node', function () {
            putils.structureString({
                type: 'some.node',
                value: 'hey'
            }).should.equal('(some.node hey)');
        });

        it('should make a concise representation of a node with one child', function () {
            putils.structureString({
                type: 'some.parent.node',
                value: {
                    type: 'child',
                    value: 'yo'
                }
            }).should.equal('(some.parent.node (child yo))');
        });

        it('should make a concise representation of a node with children', function () {
            putils.structureString({
                type: 'some.parent.node',
                value: [{
                    type: 'child',
                    value: 'yo'
                }, {
                    type: 'other',
                    value: 'hey'
                }]
            }).should.equal('(some.parent.node (child yo) (other hey))');
        });
    });
});
