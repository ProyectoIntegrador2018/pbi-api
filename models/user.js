const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
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
        type: String
    },
    rectoria: {
        type: String
    },
    medicalRecord: {
        age: {
            type: Number,
            default: 0
        },
        // birthDate:{
        //     type: Date
        // },
        insuranceCompany: {
            type: String,
            default: ""
        },
        securityNumber: {
            type: String,
            default: ""
        },
        hospital: {
            type: String,
            default: ""
        },
        contactName: {
            type: String,
            default: ""
        },
        contactPhone: {
            type: Number,
            default: 0
        },
        contactRelationship: {
            type: String,
            default: ""
        },
        illnesses: {
            type: [String]
        },
        flagRecentInjury: {
            type: Boolean,
            default: false
        },
        injuryIndication: {
            type: String,
            default: ""
        },
        flagMedicine: {
            type: Boolean,
            default: false
        },
        medicineIndication: {
            type: String,
            default: ""
        },
        physicalCondition: {
            type: String,
            default: ""
        }
    },
    filledRecord: {
        type: Boolean,
        default: false
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Class'
    }],
    attendance: [{
        class: {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Class',
            required: true
        },
        retired: {
            type: Boolean,
            required: true
        },
        record: [{
            date: {
                type: Date,
                required: true
            },
            assistance: {
                type: Boolean,
                required: true
            }
        }]
    }],
    locker: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Cabin'
    }
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
})

userSchema.virtual('terms', {
    ref: 'Term',
    localField: '_id',
    foreignField: 'signedUser'
})


const User = mongoose.model('User', userSchema)

module.exports = User
