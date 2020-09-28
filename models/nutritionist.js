const mongoose = require('mongoose')
const validator = require('validator')
const {SECRET} = require('../config');

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
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Correo inválido')
            }
        }
    },
    departamento: {
        type: String,
        default: ""
    },
    rectoria: {
        type: String,
        default: ""
    },
    records: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Record'
    }],
    appointments: [{
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
