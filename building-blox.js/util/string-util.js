module.exports = {
  titlize: function (str) {
    return str.toLowerCase().replace(/(?:^|[\s-/])\w/g, function (match) {
        return match.toUpperCase();
    }).replace('-', '');
  },
};
