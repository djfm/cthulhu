var combinators = require('./parser-combinators');
var components  = require('./parser-components');
var tokenizer   = require('./tokenizer');
var pparser     = require('./precedence-parser');

var grammar     = require('../etc/grammar');

function groupParser(opener, closer, type) {
    return combinators.map(combinators.sequence(
        components.rawString(opener),
        combinators.map(combinators.many(expression), function (node) {
            return node.value;
        }),
        components.rawString(closer)
    ), function (node) {
        return {
            type: type,
            value: node.value[1],
            row: node.row,
            col: node.col
        };
    });
}

function expression (str, start, row, pos) {
    return combinators.first(
        groupParser('(', ')', 'group.paren'),
        groupParser('{', '}', 'group.curly'),
        groupParser('[', ']', 'group.square'),
        components.quotedString,
        components.anythingExcept('"()[]{}')
    )(str, start, row, pos);
}

function root (str, start, row, col) {
    return combinators.map(combinators.many(expression), function (node) {
        return node.value;
    })(str, start, row, col);
}

function map (nodeOrArrayOfNodes, transform, combine) {
    var newNodes = [];

    if (Object.prototype.toString.call(nodeOrArrayOfNodes) === '[object Array]') {
        for (var i = 0, len = nodeOrArrayOfNodes.length; i < len; ++i) {
            var newNode = map(nodeOrArrayOfNodes[i], transform);
            if (newNode.error) {
                return newNode;
            } else if (Object.prototype.toString.call(newNode) === '[object Array]'){
                newNodes = newNodes.concat(newNode);
            } else {
                newNodes.push(newNode);
            }
        }
        return combine ? combine(newNodes) : newNodes;
    } else if (nodeOrArrayOfNodes.error) {
        return nodeOrArrayOfNodes;
    } else if (Object.prototype.toString.call(nodeOrArrayOfNodes.value) === '[object Array]') {
        newNodes = map(nodeOrArrayOfNodes.value, transform);
        if (newNodes.error) {
            return newNodes;
        } else {
            nodeOrArrayOfNodes.value = newNodes;
            return transform(nodeOrArrayOfNodes);
        }
    } else {
        return transform(nodeOrArrayOfNodes);
    }
}

function tokenize (nodeOrArrayOfNodes) {
    return map(nodeOrArrayOfNodes, function (node) {
        if (node.type === 'raw') {
            return tokenizer.tokenize(grammar.tokens, node.value, node.row, node.col);
        } else {
            return node;
        }
    });
}

function applyPrecedence (nodeOrArrayOfNodes) {
    var parse = pparser.parse.bind(undefined, grammar.operators);
    return map(nodeOrArrayOfNodes, function noop (x) {
        return x;
    }, parse);
}

/** Passes **/

function firstPass (str) {
    var recognized = root(str, 0, 0, 0);

    if (recognized.nextStart !== str.length) {
        return {
            error: 'Incomplete input program.',
            pos: recognized.nextStart,
            row: recognized.nextRow,
            col: recognized.nextCol
        };
    }

    return recognized;
}

function secondPass (str) {
    var fp = firstPass(str);
    if (fp.error) {
        return fp;
    }
    var sp = tokenize(fp.expression);
    return sp;
}

function thirdPass (str) {
    var sp = secondPass(str);
    if (sp.error) {
        return sp;
    }
    var tp = applyPrecedence(sp);
    return tp;
}

function parse (str) {
    return exports.secondPass(str);
}

exports.firstPass = firstPass;
exports.secondPass = secondPass;
exports.thirdPass = thirdPass;
exports.tokenize = tokenize;
exports.parse = parse;
