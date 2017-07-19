var express = require('express'),
router = express.Router();

// Main page renderings
router.get('/', function(req, res) {
   res.render('league');
});

router.get('/players', function(req, res) {
   res.render('player');
});

router.get('/defenses', function(req, res) {
   res.render('defenses');
});

module.exports = router;
