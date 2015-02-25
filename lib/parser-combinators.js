exports.sequence = function sequenceCombinator (/* parsers... */) {
    var parsers = Array.prototype.slice.call(arguments);

    return function (str, start, row, col) {

        var recognized = [];
        var initialStart = start;

        var startRow = null;
        var startCol = null;

        for (var i = 0, len = parsers.length; i < len; ++i) {

            var parsed = parsers[i](str, start, row, col);
            if (!parsed.error) {

                if (startRow === null && startCol === null) {
                    startRow = parsed.expression.row;
                    startCol = parsed.expression.col;
                }

                recognized.push(parsed.expression);

                start = parsed.nextStart;
                row = parsed.nextRow;
                col = parsed.nextCol;
            } else {
                return parsed;
            }
        }

        return {
            expression: {
                type: 'sequence',
                value: recognized,
                row: startRow,
                col: startCol
            },
            start: initialStart,
            nextStart: start,
            nextRow: row,
            nextCol: col
        };
    };
};

exports.first = function firstCombinator (/* parsers... */) {
    var parsers = Array.prototype.slice.call(arguments);
    return function (str, start, row, col) {

        var errors = [];

        for (var i = 0, len = parsers.length; i < len; ++i) {
            var parsed = parsers[i](str, start, row, col);
            if (!parsed.error) {
                return parsed;
            } else {
                errors.push(parsed.error);
            }
        }

        return {
            error: {
                message: 'No alternative matched the input.',
                errors: errors,
                pos: start,
                row: row,
                col: col
            }
        };
    };
};

exports.many = function manyCombinator (parser) {
    return function (str, start, row, col) {

        var nextStart, nextRow, nextCol, startRow, startCol;

        startRow = row;
        startCol = col;
        nextStart = start;
        nextRow = row;
        nextCol = col;

        var expressions = [];
        for (;;) {
            var parsed = parser(str, nextStart, nextRow, nextCol);
            if (parsed.error) {
                if (expressions.length === 0) {
                    return parsed;
                } else {
                    return {
                        expression: {
                            type: 'many',
                            value: expressions,
                            row: startRow,
                            col: startCol
                        },
                        start: start,
                        nextStart: nextStart,
                        nextRow: nextRow,
                        nextCol: nextCol
                    };
                }
            } else {
                nextStart = parsed.nextStart;
                nextRow = parsed.nextRow;
                nextCol = parsed.nextCol;
                expressions.push(parsed.expression);
            }
        }
    };
};

exports.map = function (parser, mapper) {
    return function (str, start, row, col) {
        var parsed = parser(str, start, row, col);
        if (!parsed.error) {
            parsed.expression = mapper(parsed.expression);
        }
        return parsed;
    };
};
