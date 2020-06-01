const mongoose = require('mongoose')
const validator = require('validator')

const professorSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        require: true,
    },
    nomina: {
        type: String,
        required: true,
        unique: true
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
    campus: {
        type: String,
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Class'
    }]
})


const Professor = mongoose.model('Professor', professorSchema)

module.exports = Professor
