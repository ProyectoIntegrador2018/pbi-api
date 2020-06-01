const Appointment = require('../models/appointment')
const Record = require('../models/record')
const Nutritionist = require("../models/nutritionist")
const User = require('../models/record')

const createAppointment = function (req, res) {
    const _nutriId = req.nutritionist._id
    const nutri = req.nutritionist
    const _name = req.nutritionist.name + ' ' + req.nutritionist.surname
    var appointment = new Appointment(req.body)
    appointment.record = req.params.id
    appointment.nutritionist = {
        name: _name,
        _id: _nutriId
    }
    appointment.save().then(() => {
        Record.findById(req.params.id).then((record) => {
            if (!record) {
                return res.status(404).send({ error: "Expediente no encontrado" })
            }
            record.appointments.push(appointment._id)
            record.save().then(() => {
                nutri.appointments.push(appointment._id)
                nutri.save().then(() => {
                    return res.send({ record: record, appointment: appointment })
                }).catch(() => {
                    return res.status(400).send({ error: "Hubo un error, intentalo de después" })
                })
            }).catch((error) => {
                return res.status(400).send({ error: "Hubo un error, intentalo de nuevo" })
            })
        })
    }).catch(error => {
        return res.status(500).send({ error: "Hubo un error al guardar los datos" })
    })
}

//Get data of a spefific appointment
const getAppointment = function (req, res) {
    const id = req.params.id
    Appointment.findById(id).then((appoint) => {
        if (!appoint) {
            return res.status(400).send({ error: "Cita no encontrada" })
        }
        return res.send(appoint)
    }).catch(() => {
        return res.status(500).send({ error: "No se pudo buscar la cita" })
    })
}

//Get all appointments assigned to a Record
const getAppointments = function (req, res) {
    const recordID = req.params.id
    Record.findById(recordID).then((record) => {
        if (!record) {
            return res.status(400).send({ error: "Registro no válido" })
        }
        Appointment.find({ '_id': { $in: record.appointments } }).then((listAppoint) => {
            //Se obtiene la lista de citas de historicamente
            if (req.query.term) {//Filtrar por term
                //Aun no programado
            } else {//Mostrar todas las citas
                return res.send(listAppoint)
            }
        }).catch(() => {
            return res.status(500).send({ error: "Hubo un error en la búsqueda" })
        })
    }).catch(() => {
        return res.status(500).send({ error: "No se pudo encontrar la información" })
    })
}

const deleteAppointment = function (req, res) {
    const _id = req.params.id
    Appointment.findByIdAndDelete(_id).then((appointment) => {
        if (!appointment) {
            return res.status(400).send({ error: "No se encontró borrar el elemento indicado" })
        }
        return res.send(appointment)
    }).catch((_) => {
        return res.status(500).send({ error: "No se pudo borrar el elemento" })
    })
}

const updateAppointment = function (req, res) {
    const id = req.params.id
    Appointment.findByIdAndUpdate(id, req.body).then((appoint) => {
        if (!appoint) {
            return res.status(400).send({ error: "Cita no encontrada" })
        }
        return res.send(appoint)
    }).catch(() => {
        return res.status(500).send({ error: "No se guardaron los cambios" })
    })
}

const getAppointmentsSpan = function (req, res) {
    const _start = new Date(req.body.startDate)
    const _end = new Date(req.body.endDate + 'T23:59:59.000Z')
    Appointment.find({ 'date': { $gte: _start, $lte: _end } }).populate('record').then(function (appointments) {
        res.send(appointments)
    }).catch(function (error) {
        return res.status(500).send({ error: error })
    })
}


module.exports = {
    createAppointment: createAppointment,
    deleteAppointment: deleteAppointment,
    updateAppointment: updateAppointment,
    getAppointment: getAppointment,
    getAppointments: getAppointments,
    getAppointmentsSpan: getAppointmentsSpan
}