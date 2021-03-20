let out = {};

out.dv = function(input) {
    if (!input) { return input; }
    if (input.length) { return input.map(out.dv); }
    return input.toJSON();
};

module.exports = out;