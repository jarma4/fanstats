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

var recordSchema = new mongoose.Schema({
   record: String,
   manager: String,
   year: Number,
   week: Number
   // wkHigh1 : Number,
   // wkHigh2 : Number,
   // wkHigh3: Number,
   // wkLow1 : Number,
   // wkLow2: Number,
	// wkLow3: Number,
   // wkHigh1_mgr : String,
   // wkHigh2_mgr : String,
   // wkHigh3_mgr: String,
   // wkLow1_mgr : String,
   // wkLow3_mgr: String,
   // wkLow2_mgr: String,
   // qbHigh: Number,
   // rbHigh: Number,
   // wrHigh: Number,
   // idpHigh: Number
});

var League = mongoose.model('League', leagueSchema);
var Managers = mongoose.model('Managers', managerSchema);
var Players = mongoose.model('Players', playerSchema);
var Records = mongoose.model('Records', recordSchema);

module.exports = {
   League: League,
   Managers: Managers,
   Players: Players,
   Records: Records
};
