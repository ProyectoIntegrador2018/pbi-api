const mongoose = require('mongoose')
const validator = require('validator')
const {SECRET} = require('../config');

const adminSchema = new mongoose.Schema({
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
    }
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
})

adminSchema.virtual('terms', {
    ref: 'Term',
    localField: '_id',
    foreignField: 'signedAdmin'
})


const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
