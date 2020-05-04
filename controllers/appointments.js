const Appointment = require('../models/appointment')
const Record = require('../models/record')

const createAppointment = function(req,res){
    const appointment = new Appointment(req.body)
    appointment.save().then(()=>{
        Record.findById(req.params.id).then((record)=>{
            record.appointments.push(appointment._id)
            record.save().then(()=>{
                return res.send({record:record,appointment:appointment})
            }).catch(()=>{
                return res.status(400).send({error:"Hubo un error, intentalo de nuevo"})
            })
        }).catch(_=>{
            return res.status(500).send({error:"No se pudo guardar la cita"})
        })
    })
}

const deleteAppointment = function(req,res){
    const _id = req.params.id
    Appointment.findByIdAndDelete(_id).then((appointment)=>{
        if(!appointment){
            return res.status(400).send({error:"No se encontró borrar el elemento indicado"})
        }
        return res.send(appointment)
    }).catch((_)=>{
        return res.status(500).send({error:"No se pudo borrar el elemento"})
    })
}

module.exports = {
    createAppointment:createAppointment,
    deleteAppointment:deleteAppointment,
    
}