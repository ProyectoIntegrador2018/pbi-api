const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    frequency: {
        type: [String],
        required: true
    },
    startHour: {
        type: String,
        required: true
    },
    endHour: {
        type: String,
        required: true,
    },
    classroom: {
        type: String,
    },
    quota: {
        type: Number,
        required: true
    },
    enrolled: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
    }],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        attendees: [{
            attendee: {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
                required: true
            },
            retired: {
                type: Boolean,
                required: true
            },
            assisted: {
                type: Boolean,
                required: true
            }
        }]
    }],
    term: {
        type: String
    }
})


const Class = mongoose.model('Class', classSchema)
module.exports = Class
