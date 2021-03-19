let out = {};

out.dv = function(input) {
    if (input.length) {
        return input.map(out.dv);
    }
    return input.toJSON();
};

module.exports = out;