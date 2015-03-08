function sliceMap (array, left, right, direction, callback) {
    var i, len = array.length, slice, pivot, data, s;

    function handleSlice () {
        slice = array.slice(i - left, i + right + 1);
        pivot = slice.splice(left, 1)[0];
        data = callback(pivot, slice);
        if (data && data.error) {
            return data;
        } else if (data) {
            array.splice(i - left, left + right + 1, data);
            i -= left;
            len -= left + right;
        }
    }

    if (direction === 1) {
        for (i = left; i + right < len; ++i) {
            s = handleSlice();
            if (s && s.error) {
                return s;
            }
        }
    } else {
        for (i = len - 1 - right; i - left >= 0; --i) {
            s = handleSlice();
            if (s && s.error) {
                return s;
            }
        }
    }

    return array;
}

function mergeRule (rule, nodes) {

    function merge (pivot, items) {
        if (pivot.type === rule.type) {
            return {
                type: 'operation',
                value: [pivot].concat(items)
            };
        }
    }

    var direction = rule.assoc === 'right' ? -1 : 1;
    return sliceMap(nodes, rule.left, rule.right, direction, merge);
}

function parse (rules, nodes) {

    for (var i = 0, rlen = rules.length; i < rlen; ++i) {
        var result = mergeRule(rules[i], nodes);
        if (result.error) {
            return result;
        }
    }

    return nodes;
}

exports.parse = parse;
