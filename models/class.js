const mongoose = require('mongoose');
const validator = require('validator')

const classSchema = new mongoose.Schema({
	name:{
		type: 		String,
		required: 	true
	},
	instructor:{
		type: 		String
	},
	frequency:{
		type: 		[String],
		required: 	true
	},
	startHour:{
		type: 		String,
		required: 	true
	},
	endHour:{
		type: 		String,
		required: 	true,
	},
	classroom:{
		type: 		String,
	},
	quota:{
		type:		Number,
		required:	true
	},
	enrolled:[{
		type: mongoose.Schema.Types.ObjectID,
		ref: 'User'
	}],
	term:{
		type: String
	}
})

const Class = mongoose.model('Class', classSchema)
module.exports = Class
