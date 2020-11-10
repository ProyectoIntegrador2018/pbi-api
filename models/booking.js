const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	date: {
		type: Date,
		required: true,
    },
	confirmed: {
		type: Boolean,
		required: true,
		default: false,
	},
	name: {
		type: String,
		required: true
	},
	patientMail: {
		type: String,
		require: true,
	},
	nutritionist: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Nutritionist",
		},
	},
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
