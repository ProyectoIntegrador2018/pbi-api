const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    height:{
        type: String,
        required: true
    },
    weight:{
        type: String,
        required: true
    },
    IMC:{
        type: String,
        required: true,
    },
    IMCDiagnostic:{
        type: String,
        required: true
    },
    muscleMass:{
        type: Number,
        required: true
    },
    fatMass:{
        type: Number,
        required: true
    },
    fatMassPct:{
        type: Number
    },
    totalWater:{
        type: Number
    },
    intercellWater:{
        type: Number
    },
    extracellWater:{
        type: Number
    },
    metabolicRate:{
        type: Number
    },
    visceralFat:{
        type: Number
    },
    waist:{
        type: Number
    },
    umbilical:{
        type: Number
    },
    hip:{
        type: Number
    },
    notes:{
        type: String
    }
})

const Appointment = mongoose.model('Appointment',appointmentSchema)
module.exports = Appointment