
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Sharing mode' });
};

exports.mirror = function(req, res) {
   res.render('mirror', { title: 'Mirror mode'});
};
