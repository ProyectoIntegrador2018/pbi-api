const mongoose = require('mongoose')

const cabinSchema = new mongoose.Schema({
    campus: {
        type: String,
        required: true
    },
    dresser: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


const Cabin = mongoose.model('Cabin', cabinSchema)
module.exports = Cabin