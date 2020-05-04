const Record = require("../models/record")

const createRecord = function(req,res){
    const record = new Record(req.body)
    record.save().then(()=>{
        return res.send(record)
    })
}

const createRecordHistory = function(req,res){
    const recordID = req.params.id
    Record.findById(recordID).then((record)=>{
        record.history = req.body
        record.save().then((saved)=>{
            return res.send(saved)
        })
       
    })
}

const getRecords = function(req, res){
    Record.find({}).then(function(records){
        return res.send(records)
    }).catch(function(error){
        res.status(500).send(error)
    })
}

const getRecord = function(req,res){
    const recordID = req.params.id
    Record.findById(recordID).then((record)=>{
        return res.send(record)
    }).then((error)=>{
        return res.status(500).send(error)
    })
}

const editRecord = function(req,res){
    const _id = req.params.id
    Record.findByIdAndUpdate(_id,req.body).then((record)=>{
        if(!record){
            return res.status(400).send()
        }
        return res.send(record)
    }).catch((error)=>{
        return res.status(500).send({error:error})
    })
}

const deleteRecord = function(req,res){
    const _id = req.params.id
    Record.findByIdAndDelete(_id).then((record)=>{
        if(!record){
            return res.status(400).send({error:"No se encontró el expediente especificado"})
        }
        return res.send(record)
    }).catch((error)=>{
        return res.status(500).send({error:error})
    })
}

const addReminder = function(req,res){
    const id = req.params.id
    Record.findById(id).then((record)=>{
        if(!record){
            return res.status(400).send({"error":"No es encontró el registro"})
        }
        record["dayReminder"] = req.body
        console.log(record)
        record.save().then((saved)=>{
            return res.send(saved)
        }).catch(()=>{
            return res.status(500).send({error:"No se pudo actualizar la información"})
        })
    }).catch(()=>{
        return res.status(500).send({error:"Hubo un error al gardar los datos"})
    })
}

module.exports = {
    createRecord: createRecord,
    createRecordHistory: createRecordHistory,
    getRecords: getRecords,
    getRecord: getRecord,
    editRecord: editRecord,
    deleteRecord: deleteRecord,
    addReminder: addReminder
}