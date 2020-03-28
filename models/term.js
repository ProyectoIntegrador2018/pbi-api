const mongoose = require('mongoose');
const validator = require('validator');

const termSchema = new mongoose.Schema({
	name:{
		type: 		String,
		required: 	true
	},
	year:{
		type: 		Number,
		required: 	true
	},
	classes:{
		type: [mongoose.Schema.Types.ObjectID],
		ref: 'Class'
	},
	startInscriptions:{
		type: Date,
		required: true
	},
	closeInscriptions:{
		type: Date,
		required: true
	},
	flagCurrent:{
		type: Boolean,
		default: false
	}
})

const Term = mongoose.model('Term', termSchema)
module.exports = Term