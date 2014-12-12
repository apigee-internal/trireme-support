var value = 'Script Module';

module.exports.getValue = function() {
  return value;
};

module.exports.setValue = function(v) {
  value = v;
};
