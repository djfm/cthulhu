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
    {exp: /^>/, type: 'operator.gt'},
    {exp: /^@/, type: 'operator.at'},
    {exp: /^\b\d+\.\d+\b/, type: 'const.float'},
    {exp: /^\b\d+\b/, type: 'const.int'},
    {exp: /^\w+/, type: 'const.identifier'},
    {exp: /^\./, type: 'operator.dot'}
];

var operators = [
    {type: 'operator.doubleColon'       , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.at'                , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.dot'               , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.div'               , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.mul'               , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.minus'             , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.plus'              , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.lt'                , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.gt'                , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.equal'             , left: 1, right: 1, assoc: 'right'},
    {type: 'operator.comma'             , left: 1, right: 1, assoc: 'left'},
    {type: 'operator.rightArrow'        , left: 1, right: 1, assoc: 'left'}
];

exports.tokens = tokens;
exports.operators = operators;
