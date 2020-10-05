const mongoose = require('mongoose')
const validator = require('validator')

const appointmentSchema = new mongoose.Schema({
    record: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
    },
    nutritionist: {
        name: {
            type: String
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Nutritionist'
        }
    },
    date: {
        type: Date,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    IMC: {
        type: String,
        required: true,
    },
    IMCDiagnostic: {
        type: String,
        required: true
    },
    muscleMass: {
        type: Number
    },
    fatMass: {
        type: Number
    },
    fatMassPct: {
        type: Number
    },
    totalWater: {
        type: Number
    },
    intercellWater: {
        type: Number
    },
    extracellWater: {
        type: Number
    },
    metabolicRate: {
        type: Number
    },
    visceralFat: {
        type: Number
    },
    waist: {
        type: Number
    },
    umbilical: {
        type: Number
    },
    hip: {
        type: Number
    },
    notes: {
        type: String
    },
    nutritionist: {
        name: {
            type: String,
            required: true
        },
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Nutritionist'
        }
    },
    diet: {
        fruit: {
            type: Number,
            default: 0
        },
        vegetable: {
            type: Number,
            default: 0
        },
        legume: {
            type: Number,
            default: 0
        },
        cereal: {
            type: Number,
            default: 0
        },
        sugar: {
            type: Number,
            default: 0
        },
        fat: {
            type: Number,
            default: 0
        },
        milkWhole: {
            type: Number,
            default: 0
        },
        milkSemiSkimmed: {
            type: Number,
            default: 0
        },
        milkSkimmed: {
            type: Number,
            default: 0
        },
        meatWhole: {
            type: Number,
            default: 0
        },
        meatSemiGreasy: {
            type: Number,
            default: 0
        },
        meatGreasy: {
            type: Number,
            default: 0
        },
    },
})


const Appointment = mongoose.model('Appointment', appointmentSchema)
module.exports = Appointment