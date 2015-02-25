exports.anythingExcept = function anythingExcept (chars) {
    return function (str, start, row, col) {
        var i = start;
        var matched = '';

        var nextRow = row;
        var nextCol = col;

        function updatePos (c) {
            if (c === "\n") {
                ++nextRow;
                nextCol = 0;
            } else {
                ++nextCol;
            }
        }

        for (; i < str.length; ++i) {

            var c = str[i];

            if (chars.indexOf(c) === -1) {
                matched += c;
                updatePos(c);
            } else {
                break;
            }
        }

        if (matched === '') {
            return {
                error: {
                    message: 'Unexpected `' + str[i] + '`.',
                    pos: i,
                    row: row,
                    col: col
                }
            };
        }

        return {
            expression: {
                type: 'raw',
                value: matched,
                row: row,
                col: col
            },
            start: start,
            nextStart: i,
            nextRow: nextRow,
            nextCol: nextCol
        };
    };
};

exports.rawString = function rawString (toRecognize) {
    return function (str, start, row, col) {
        var nextStart = start + toRecognize.length;
        if (str.substring(start, nextStart) === toRecognize) {

            var lines = toRecognize.split("\n");
            var nextRow = row + lines.length - 1;
            var nextCol = lines.length > 1 ? lines[lines.length - 1].length : col + toRecognize.length;

            return {
                expression: {
                    type: 'raw',
                    value: toRecognize,
                    row: row,
                    col: col
                },
                start: start,
                nextStart: nextStart,
                nextRow: nextRow,
                nextCol: nextCol
            };
        } else {
            return {
                error: {
                    message: 'Expected `' + toRecognize + '`.',
                    pos: start,
                    row: row,
                    col: col
                }
            };
        }
    };
};

exports.quotedString = function quotedString (str, start, row, col) {
    var nextRow = row;
    var nextCol = col;

    function updatePos (c) {
        if (c === "\n") {
            ++nextRow;
            nextCol = 0;
        } else {
            ++nextCol;
        }
    }

    var state = 'beforeString';

    var contents = '';

    for (var i = start; i < str.length; ++i) {
        var c = str[i];

        if (state === 'beforeString') {
            if (c === '"') {
                state = 'inString';
            } else {
                return {
                    error: {
                        message: 'Expected `"`, string cannot start.',
                        pos: i,
                        row: nextRow,
                        col: nextCol
                    }
                };
            }
        } else if (state === 'inString') {
            if (c === '"') {
                updatePos(c);
                return {
                    expression: {
                        type: "string",
                        value: contents,
                        row: row,
                        col: col
                    },
                    nextStart: i + 1,
                    nextRow: nextRow,
                    nextCol: nextCol
                };
            } else if (c === '\\') {
                state = 'inEscape';
            } else {
                contents += c;
            }
        } else if (state === 'inEscape') {
            contents += c;
            state = 'inString';
        }

        updatePos(c);
    }

    return {
        error: {
            message: 'Expected `"`, unterminated string.',
            pos: i - 1,
            row: nextRow,
            col: nextCol
        }
    };
};
