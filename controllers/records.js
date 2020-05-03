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



module.exports = {
    createRecord: createRecord,
    createRecordHistory: createRecordHistory,
    getRecords: getRecords,
    getRecord: getRecord,

}