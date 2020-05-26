const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

if (process.env.NODE_ENV === 'production') {
    var SECRET = process.env.SECRET;
} else {
    const config = require('../config.js')
    var SECRET = config.secret;
}

const nutritionistSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    nomina: {
        type: String,
        required: true,
        unique: true,
    },
    records: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Record'
    }],
    appointments:[{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Appointment'
    }
    ]

}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
})

nutritionistSchema.virtual('terms', {
    ref: 'Term',
    localField: '_id',
    foreignField: 'signedNutritionist'
})


const Nutritionist = mongoose.model('Nutritionist', nutritionistSchema)

module.exports = Nutritionist
