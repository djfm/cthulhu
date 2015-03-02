var tokens = [
    {exp: /^\s+/, type: null},
    {exp: /^::/, type: 'operator.doubleColon'},
    {exp: /^->/, type: 'operator.rightArrow'},
    {exp: /^,/, type: 'operator.comma'},
    {exp: /^\+/, type: 'operator.plus'},
    {exp: /^-/, type: 'operator.minus'},
    {exp: /^\*/, type: 'operator.mul'},
    {exp: /^\*/, type: 'operator.div'},
    {exp: /^=/, type: 'operator.equal'},
    {exp: /^</, type: 'operator.lt'},
    {exp: /^@/, type: 'operator.at'},
    {exp: /^\b\d+\.\d+\b/, type: 'const.float'},
    {exp: /^\b\d+\b/, type: 'const.int'},
    {exp: /^\w+/, type: 'const.identifier'},
    {exp: /^\./, type: 'operator.dot'}
];

function tokenize (str, row, col) {

    var recognized = [];

    function updatePos (str) {
        var lines = str.split("\n");
        row += lines.length - 1;
        col = lines.length <= 1 ? col + str.length : lines[lines.length - 1].length;
    }

    while ('' !== str) {
        var ok = false;

        for (var i = 0, len = tokens.length; i < len; ++i) {
            var tok = tokens[i];
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
