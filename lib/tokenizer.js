function tokenize (rules, str, row, col) {

    var recognized = [];

    function updatePos (str) {
        var lines = str.split("\n");
        row += lines.length - 1;
        col = lines.length <= 1 ? col + str.length : lines[lines.length - 1].length;
    }

    while ('' !== str) {
        var ok = false;

        for (var i = 0, len = rules.length; i < len; ++i) {
            var tok = rules[i];
            var m = tok.exp.exec(str);
            if (m && m.index === 0 && m[0].length > 0) {

                ok = true;

                /* jshint maxdepth:4 */
                if (null !== tok.type) {
                    recognized.push({
                        type: tok.type,
                        value: m[0],
                        row: row,
                        col: col
                    });
                }

                str = str.substr(m[0].length);

                updatePos(m[0]);
            }
        }

        if (!ok) {
            return {
                error: {
                    message: 'No token recognized.',
                    context: str,
                    row: row,
                    col: col
                }
            };
        }
    }

    return recognized;
}

exports.tokenize = tokenize;
