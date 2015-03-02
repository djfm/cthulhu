var combinators = require('./parser-combinators');
var components  = require('./parser-components');
var tokenizer   = require('./tokenizer');

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

/** Building blocks **/

function tokenizeArrayOfNodes (node) {
    var tokens = [];
    for (var i = 0, len = node.length; i < len; ++i) {
        var child = node[i];
        if (child.type === "raw") {
            var childTokens = tokenizer.tokenize(child.value, child.row, child.col);
            if (childTokens.error) {
                return childTokens;
            }
            tokens = tokens.concat(childTokens);
        } else {
            var maybeArray = tokenize(child);
            if (maybeArray.error) {
                return maybeArray;
            } else if (Object.prototype.toString.call(maybeArray) === '[object Array]') {
                tokens = tokens.concat(maybeArray);
            }
            else {
                tokens.push(maybeArray);
            }
        }
    }
    return tokens;
}

function tokenize (nodeOrArray) {
    if (Object.prototype.toString.call(nodeOrArray) === '[object Array]') {
        return tokenizeArrayOfNodes(nodeOrArray);
    } else if (nodeOrArray && nodeOrArray.value && Object.prototype.toString.call(nodeOrArray.value) === '[object Array]') {
        var maybeTokens = tokenize(nodeOrArray.value);
        if (maybeTokens.error) {
            return maybeTokens;
        }
        nodeOrArray.value = maybeTokens;
        return nodeOrArray;
    } else {
        return nodeOrArray;
    }
}

/** Passes **/

function firstPass (str) {
    return root(str, 0, 0, 0);
}

function secondPass (str) {
    var fp = firstPass(str);
    if (fp.error) {
        return fp;
    }
    var sp = tokenize(fp.expression);
    return sp;
}

function parse (str) {
    return exports.secondPass(str);
}

exports.firstPass = firstPass;
exports.secondPass = secondPass;
exports.tokenize = tokenize;
exports.parse = parse;
