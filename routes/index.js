
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Sharing mode' });
};

exports.share = function(req, res) {
   res.render('share', { title: 'Share mode'});
};

exports.mirror = function(req, res) {
   res.render('mirror', { title: 'Mirror mode'});
};
