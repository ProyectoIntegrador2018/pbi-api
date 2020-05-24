const mongoose = require('mongoose');

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
