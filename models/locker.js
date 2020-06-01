const mongoose = require('mongoose')

const lockerSchema = new mongoose.Schema({
    campus: {
        type: String,
        required: true
    },
    dresser: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    lockers: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Cabin'
    }]
})


const Locker = mongoose.model('Locker', lockerSchema)
module.exports = Locker