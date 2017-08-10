var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	currentHp: { type: Number, required: true },
	level: { type: Number, required: true },
	exp: { type: Number, required: true },
	potionQtys: { type: Array, required: true },
	potionTimesRemaining: { type: Array, required: true },
	zoneNum: { type: Number, required: true },
	enemyNum: { type: Number, required: true }
})

var Save = mongoose.model("SaveData", schema);

router.get('/', (req, res, next) => {
	getSaveData(req, res, next);
})

router.post('/', (req, res, next) => {
	Save.create(req.body)
		.then(save => {
			getSaveData(req, res, next);
		})
		.catch(next);
})

router.put('/', (req, res, next) => {
	Save.update({ upsert: true }, req.body)
		.then(save => {
			getSaveData(req, res, next);
		})
		.catch(next);
})

function getSaveData(req, res, next) {
	Save.find({})
		.then(save => {
			res.send(save);
		})
		.catch(next);
}

router.use(defaultErrorHandler);

function defaultErrorHandler(err, req, res, next) {
	res.json({ success: false, error: err.message });
}

module.exports = router;