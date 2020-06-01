const Term = require('../models/term');
const Class = require('../models/class')
var moment = require('moment-timezone');
moment.tz.setDefault("America/Monterrey");

const createTerm = function (req, res) {
    var inscStartDate = new Date(req.body.startInscriptions)
    var inscCloseDate = new Date(req.body.closeInscriptions)
    var lockStartDate = new Date(req.body.startLockerReservations)
    var lockCloseDate = new Date(req.body.closeLockerReservations)
    const term = new Term({
        name: req.body.name,
        year: req.body.year,
        startInscriptions: inscStartDate,
        closeInscriptions: inscCloseDate,
        startLockerReservations: lockStartDate,
        closeLockerReservations: lockCloseDate,
        classes: []
    })
    term.save().then(function () {
        return res.send(term)
    }).catch(function (error) {
        return res.status(400).send({ error: error })
    })
}

const getTerms = function (_, res) {
    Term.find({}, function (err, terms) {
        return res.send(terms)
    })
}

const getTermByID = function (req, res) {
    const _id = req.params.id
    Term.findById(_id, function (err, term) {
        return res.send(term)
    })
}

const getCurrentTerm = function (_, res) {
    Term.findOne({ flagCurrent: true }).then(function (term) {
        if (!term) {
            return res.status(404).send({ error: "No hay periodo actual." })
        }
        return res.send(term)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const setCurrentTerm = function (req, res) {
    const _id = req.params.id
    Term.update({ flagCurrent: true }, { $set: { flagCurrent: false } }).then(function (terms) {
        if (!terms) {
            return res.status(404).send({ error: `No hay periodos registrados.` })
        }
        Term.findOneAndUpdate({ _id: _id }, { $set: { flagCurrent: true } }).then(function (term) {
            if (!term) {
                return res.status(404).send({ error: `No existe el periodo con id ${_id}.` })
            }
            return res.send(term)
        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })

}

const deleteTerm = function (req, res) {
    const _id = req.params.id

    Term.findByIdAndDelete(_id).then(function (term) {
        if (!term) {
            return res.status(404).send()
        }
        Class.deleteMany({ _id: { $in: term.classes } }).then(
            function (_) {
                return res.send(term)
            }
        ).catch(() => { res.status(500).send({ error: "No se borraron las clases correctamente" }) })

    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const deleteTermClasses = function (req, res) {
    const _id = req.params.id
    Term.findOneAndUpdate({ _id }, { "$set": { "classes": [] } }).then(function (term) {
        if (!term) {
            return res.status(404).send({ error: `Term with id ${_id} not found.` })
        }
        return res.send(term)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const getTermClasses = function (req, res) {
    const _id = req.params.id
    Term.findById(_id, function (err, term) {
        if (term) {
            Class.find({
                '_id': { $in: term.classes }
            }, function (err, docs) {
                if (docs) {
                    return res.send(docs)
                } else {
                    return re.status(404).send({ error: "Error" })
                }
            })
        } else {
            return res.send([])
        }
    })
}

const updateTerm = function (req, res) {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'year', 'startInscriptions', 'closeInscriptions', 'startLockerReservations', 'closeLockerReservations']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    Term.findByIdAndUpdate(_id, req.body).then(function (term) {
        if (!term) {
            return res.status(404).send()
        }
        return res.send(term)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const statusFlag = function (req, res) {
    const _id = req.params.id
    const dateOfLockers = req.params.dateOfLockers
    var currDate = new Date()
    currDate = moment()._d;

    Term.findById(_id).then(function (term) {
        if (!term) {
            return res.status(404).send({ error: `El periodo con id ${_id} no existe.` })
        }
        if (dateOfLockers === 'true') {
            var dateClose = term.closeLockerReservations
            var dateOpen = term.startLockerReservations
        } else {
            var dateClose = term.closeInscriptions
            var dateOpen = term.startInscriptions
        }

        const diffTimeLate = dateClose - currDate
        const diffTimeEarly = currDate - dateOpen
        if (diffTimeLate <= 0 || diffTimeEarly < 0) {
            return res.send({ status: false })
        } else {
            return res.send({ status: true })
        }
    }).catch(function (error) {
        res.status(500).send(error)
    })
}


module.exports = {
    createTerm: createTerm,
    getTerms: getTerms,
    getTermByID: getTermByID,
    getCurrentTerm: getCurrentTerm,
    setCurrentTerm: setCurrentTerm,
    deleteTerm: deleteTerm,
    getTermClasses: getTermClasses,
    deleteTermClasses: deleteTermClasses,
    updateTerm: updateTerm,
    statusFlag: statusFlag
}
