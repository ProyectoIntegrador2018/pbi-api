const mongoose = require('mongoose')
const validator = require('validator')

const appointmentSchema = new mongoose.Schema({
    record:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
    },
    date:{
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
        type: Number,
        required: true
    },
    fatMass: {
        type: Number,
        required: true
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
    nutritionist:{
        name:{
            type: String,
            required: true
        },
        _id:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Nutritionist'
        }
    }
})

const Appointment = mongoose.model('Appointment', appointmentSchema)
module.exports = Appointment