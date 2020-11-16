const Record = require("../models/record")
const Nutritionist = require("../models/nutritionist")
const uuid = require('uuid');

const createRecord = async function (req, res) {
    var _nutrID

    if (req.nutritionist) {
        _nutrID = req.nutritionist._id
    } else {
        _nutrID = req.body.id
    }

    var nutritionist = await Nutritionist.findById(_nutrID)
    if (!nutritionist) {
        return res.status(404).send({ error: `El nutriólogo con id ${_nutrID} no existe` })
    }
    req.body.nutritionist = _nutrID
    const record = new Record(req.body)

    record.save().then(() => {
        nutritionist.records.push(record)
        nutritionist.save().then(() => {
            return res.send(record)
        })
    }).catch(error => {
        console.log(error);
        res.statusMessage = "Error creando expediente";
        return res.status(401).end();
    })
}

const createRecordHistory = function (req, res) {
    const recordID = req.params.id
    Record.findById(recordID).then((record) => {
        record.history = req.body
        record.save().then((saved) => {
            return res.send(saved)
        })

    })
}

const getRecords = function (req, res) {
    Record.find({}).then(function (records) {
        return res.send(records)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const getRecord = function (req, res) {
    const recordID = req.params.id
    Record.findById(recordID).then((record) => {
        return res.send(record)
    }).catch((error) => {
        return res.status(500).send(error)
    })
}

const editRecord = function (req, res) {
    const _id = req.params.id
    Record.findByIdAndUpdate(_id, req.body).then((record) => {
        if (!record) {
            return res.status(400).send()
        }
        return res.send(record)
    }).catch((error) => {
        return res.status(500).send({ error: error })
    })
}

const deleteRecord = function (req, res) {
    const _id = req.params.id
    Record.findByIdAndDelete(_id).then((record) => {
        if (!record) {
            return res.status(400).send({ error: "No se encontró el expediente especificado" })
        }
        return res.send(record)
    }).catch((error) => {
        return res.status(500).send({ error: error })
    })
}

const addReminder = function (req, res) {
    const id = req.params.id
    Record.findById(id).then((record) => {
        if (!record) {
            return res.status(400).send({ "error": "No es encontró el registro" })
        }
        record["dayReminder"] = req.body
        record.save().then((saved) => {
            return res.send(saved)
        }).catch(() => {
            return res.status(500).send({ error: "No se pudo actualizar la información" })
        })
    }).catch(() => {
        return res.status(500).send({ error: "Hubo un error al gardar los datos" })
    })
}

async function addDiet(req, res) {
    const reqId = req.params.id;
    if (!req.body.diet) {
        return res.status(400).send({ error: "Necesita mandarse una dieta" });
    }
    const diet = req.body.diet;
    diet.id = uuid.v4();
    diet.date = new Date();
    const record = await Record.findByIdAndUpdate(reqId, { $push: { diets: diet } }, { new: true });
    if (!record) {
        return res.status(400).send({ error: "No se encontró el registro" });
    }
    return res.status(200).json(record);
}

async function deleteDiet(req, res) {
    const reqId = req.params.recordId;
    const dietId = req.params.dietId;
    const record = await Record.findByIdAndUpdate(reqId, { $pull: { diets: { id: dietId } } }, { new: true });
    if (!record) {
        return res.status(400).send({ error: "No se encontró el registro" });
    }
    return res.status(200).json(record);
}

async function editDiet(req, res) {
    const reqId = req.params.recordId;
    const dietId = req.params.dietId;
    if (!req.body.diet) {
        return res.status(400).send({ error: "Necesita mandarse una dieta" });
    }
    const newDiet = req.body.diet;
    const oldRecordDiet = await Record.findOne({ _id: reqId, "diets.id": dietId }, { "diets.$": 1 });
    if (!oldRecordDiet) {
        return res.status(400).send({ error: "Plan alimenticio no encontrado" });
    }
    const diet = oldRecordDiet.diets[0];
    for (key in newDiet) {
        diet[key] = newDiet[key];
    }
    const record = await Record.findOneAndUpdate({ _id: reqId, "diets.id": dietId }, { $set: { "diets.$": diet } }, { new: true, overwrite: false });
    if (!record) {
        return res.status(400).send({ error: "No se encontró el registro" });
    }
    return res.status(200).json(record);
}

async function getDiet(req, res) {
    const reqId = req.params.recordId;
    const dietId = req.params.dietId;
    const diet = await Record.findOne({ _id: reqId, "diets.id": dietId }, { "diets.$": 1 });
    if (!diet) {
        return res.status(400).send({ error: "No se encontró la dieta especificada" });
    }
    return res.status(200).json(diet.diets[0]);
}

module.exports = {
    createRecord: createRecord,
    createRecordHistory: createRecordHistory,
    getRecords: getRecords,
    getRecord: getRecord,
    editRecord: editRecord,
    deleteRecord: deleteRecord,
    addReminder: addReminder,
    addDiet: addDiet,
    deleteDiet: deleteDiet,
    editDiet: editDiet,
    getDiet: getDiet,
}