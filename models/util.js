const Managers = require('./dbschema').Managers;

module.exports = {
	getManagers: (season) => {
		return new Promise(function(resolve, reject){
			let tmp = (season != 'All')?season:2016;
			Managers.find({start:{$lte: tmp}, end:{$gte: tmp}}, {name: 1},  function(err, managers){
				resolve (managers);
			}).sort({name:1});
		});
	}
};