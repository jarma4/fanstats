var mongoose = require('mongoose');

var managerSchema = new mongoose.Schema({
   name : String,
   num : Number,
   start : Number,
   end: Number
});

var leagueSchema = new mongoose.Schema({
   year : Number,
   week : Number,
   manager : String,
   qb: Number,
   rb1: Number,
   rb2: Number,
   wr1: Number,
   wr2: Number,
   wr3te: Number,
   idp1: Number,
   idp2: Number,
   idp3: Number,
   dst: Number,
   k: Number,
   total: Number
}, {collection: 'league'});   // colleciton object needed when collection name not plural

var playerSchema = new mongoose.Schema({
   player : String,
   position : String,
   year: Number,
   week : Number,
   points: Number,
	rushing_yards: Number,
   rushing_tds: Number,
	receive_yards: Number,
   receive_tds: Number,
   passing_yards: Number,
   passing_tds: Number
});

var League = mongoose.model('League', leagueSchema);
var Managers = mongoose.model('Managers', managerSchema);
var Players = mongoose.model('Players', playerSchema);

module.exports = {
   League: League,
   Managers: Managers,
   Players: Players
};
