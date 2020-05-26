const Professor = require('../models/professor')
const Class = require('../models/class')
const User = require('../models/user')

const createProfessor = function (req, res) {
    const professor = new Professor(req.body)
    professor.save().then(function () {
        return res.send(professor)
    })
}

const getProfessors = function (req, res) {
    Professor.find({}).then(function (professors) {
        return res.send(professors)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const getProfessor = function (req, res) {
    const _profID = req.params.id
    Professor.findById(_profID).populate('classes').then(function (professor) {
        return res.send(professor)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const updateProfessor = function (req, res) {
    const _profID = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surname']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    Professor.findByIdAndUpdate(_profID, req.body).then(function (professor) {
        if (!professor) {
            return res.status(404).send(`El profesor con id ${_profID} no existe`)
        }
        return res.send(professor)
    }).catch(function (error) {
        res.status(500).send({ error: error })
    })
}

const deleteProfessor = async function (req, res) {
    const _profID = req.params.id

    Professor.findByIdAndDelete(_profID).then(function (professor) {
        if (!professor) {
            return res.status(404).send(`El profesor con id ${_profID} no existe`)
        }
        const _len = professor.classes.length
        const classes = professor.classes
        for (var i = 0; i < _len; i++) {
            Class.findByIdAndUpdate(classes[i], { instructor: null }).then(function (course) {
                console.log(`Se elimino al profesor de la clase con id ${_classes[i]}`)
            }).catch(function (error) {
                res.status(500).send({ error: error })
            })
        }
        return res.send(professor)
    }).catch(function (error) {
        res.status(500).send({ error: error })
    })
}

module.exports = {
    createProfessor: createProfessor,
    getProfessors: getProfessors,
    getProfessor: getProfessor,
    updateProfessor: updateProfessor,
    deleteProfessor: deleteProfessor
}