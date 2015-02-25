exports.structureString = function structureString (node, withPos) {
    if (typeof node === 'string') {
        return node;
    } else if (node && node.type) {
        if (withPos) {
            return '([' + node.row + ':' + node.col + '] ' + node.type + ' ' + structureString(node.value, withPos) + ')';
        } else {
            return '(' + node.type + ' ' + structureString(node.value, withPos) + ')';
        }
    } else if (Object.prototype.toString.call(node) === '[object Array]') {
        return node.map(function (node) {
            return structureString(node, withPos);
        }).join(' ');
    } else {
        throw new Error("Don't know how to represent `" + node.toString() + "`.");
    }
};
