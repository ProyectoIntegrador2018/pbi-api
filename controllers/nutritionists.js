const Nutritionist = require('../models/nutritionist')
const Record = require('../models/record')
const Appointment = require('../models/appointment')
// const bcrypt = require('bcryptjs')
const {
    EMAIL,
    HOST,
    KEY,
    SECRET
} = require('../config');

if (process.env.NODE_ENV === 'production') {
    var frontURL = process.env.FRONTURL
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
} else {
    const config = require('../config')
    var frontURL = config.frontURL
    var MAILPORT = config.mailport
    var SECURE = config.securehost
}

const createNutritionist = function (req, res) {
    const nutritionist = new Nutritionist(req.body)
    nutritionist.save().then(function () {
        return res.send(nutritionist)
    }).catch((error) => {
        if (error.errmsg.includes("nomina")) {
            return res.status(400).send({ error: "Ya existe un nutriólogo con la nómina especificada" })
        } else if (error.errmsg.includes("email")) {
            return res.status(400).send({ error: "Ya existe un nutriólogo con el correo especificado" })
        } else {
            return res.status(400).send({ error: "Error desconocido" })
        }
    })
}

const getNutritionists = function (req, res) {
    Nutritionist.find({}).then(function (nutritionists) {
        return res.send(nutritionists)
    }).catch(function (error) {
        return res.status(500).send(error)
    })
}

const getNutritionist = function (req, res) {
    const _id = req.params.id
    Nutritionist.findById(_id).populate('records').then(function (nutritionist) {
        if (!nutritionist) {
            return res.status(404).send({ error: `El nutriólogo con id ${_id} no existe` })
        }
        return res.send(nutritionist)
    }).catch(function (error) {
        return res.status(505).send({ error: error })
    })
}

const login = function (req, res) {
    const _email = req.body.email
    const _pwd = req.body.password
    Nutritionist.findByCredentials(_email, _pwd).then(function (nutritionist) {
        nutritionist.generateToken().then(function (token) {
            return res.send({ nutritionist, token })
        }).catch(function (error) {
            return res.status(401).send({ error: "Correo o contraseña inválidos", type: 1 })
        })
    }).catch(function (error) {
        return res.status(505).send({ error: error })
    })
}

const logout = function (req, res) {
    req.nutritionist.tokens = req.nutritionist.tokens.filter(function (token) {
        return token.token !== req.token
    })
    req.nutritionist.save().then(function () {
        return res.send(true)
    }).catch(function (error) {
        return res.status(500).send({ error: error })
    })
}

const deleteNutritionist = async function (req, res) {
    const _id = req.params.id

    var nutritionist = await Nutritionist.findByIdAndDelete(_id)
    if (!nutritionist) {
        return res.status(404).send({ error: `El nutriólogo con id ${_id} no existe` })
    }
    // Pendiente codigo para expedientes
    return res.send(nutritionist)
}

const validateSession = function (req, res) {
    const token = req.query.token
    Nutritionist.validateToken(token).then(function (data) {
        return res.send(data)
    }).catch(function () {
        return res.send(false)
    })
}

function jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
}

const report = async function (req, res) {
    const nutritionist_id = req.params.id
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    const grouped = {}
    var listaPosible = []
    endDate.setHours(23)
    endDate.setMinutes(59)

    var nutritionist = await Nutritionist.findById(nutritionist_id)

    if (!nutritionist) {
        res.status(400).send({ "error": "Nutrilogo no encontrado" })
    }
    var list = await Appointment.find({ "_id": { $in: nutritionist.appointments } })


    for (const appoint of list) {
        const dateApp = new Date(appoint.date)
        dateApp.setHours(dateApp.getHours() - 24)
        var record = await Record.findOne({ appointments: appoint._id })

        if (!grouped[record._id]) {
            grouped[record._id] = record
            grouped[record._id].appointments = []

        }
        if (dateApp.getTime() >= startDate.getTime() && dateApp.getTime() <= endDate.getTime()) {
            grouped[record._id].appointments.push(appoint._id)
        }
    }
    const listaProgramas = ["PBI","CG","Cortesía","Clase deportiva","Intramuros","Representativos","Ev. Médica","Líderes"]
    var placeHolder = {
        "PBI": 0,
        "CG": 0,
        "Cortesía": 0,
        "Clase deportiva": 0,
        "Intramuros": 0,
        "Representativos": 0,
        "Ev. Médica": 0,
        "Líderes": 0,
        "Otro": 0,
        "Total": 0
    }

    let report = {
        pacientes: {
            "Hombre": jsonCopy(placeHolder),
            "Mujer": jsonCopy(placeHolder),
            "Otro": jsonCopy(placeHolder)
        },
        citas: {
            "Hombre": jsonCopy(placeHolder),
            "Mujer": jsonCopy(placeHolder),
            "Otro": jsonCopy(placeHolder)
        }
    }

    for (const patient in grouped) {
        if(!listaProgramas.includes(grouped[patient].program)){
            grouped[patient].program = "Otro"
        }
        //Agregar al contador de pacientes total
        if (!report["pacientes"][grouped[patient].gender]["Total"]) {
            report["pacientes"][grouped[patient].gender]["Total"] = 1;
        } else {
            report["pacientes"][grouped[patient].gender]["Total"] += 1;
        }
        //Agregar al contador de pacientes de su programa
        if (!report["pacientes"][grouped[patient].gender][grouped[patient].program]) {
            report["pacientes"][grouped[patient].gender][grouped[patient].program] = 1;
        } else {
            report["pacientes"][grouped[patient].gender][grouped[patient].program] += 1;
        }

        //Agregar al contador de citas total
        if (!report["citas"][grouped[patient].gender]["Total"]) {
            report["citas"][grouped[patient].gender]["Total"] = grouped[patient].appointments.length;
        } else {
            report["citas"][grouped[patient].gender]["Total"] += grouped[patient].appointments.length;
        }
        //Agregar al contador de citas del programa
        if (!report["citas"][grouped[patient].gender][grouped[patient].program]) {
            report["citas"][grouped[patient].gender][grouped[patient].program] = grouped[patient].appointments.length;
        } else {
            report["citas"][grouped[patient].gender][grouped[patient].program] += grouped[patient].appointments.length;
        }
    }
    return res.send(report)
}


module.exports = {
    createNutritionist: createNutritionist,
    getNutritionists: getNutritionists,
    getNutritionist: getNutritionist,
    // changePassword:changePassword,
    login: login,
    logout: logout,
    deleteNutritionist: deleteNutritionist,
    validateSession: validateSession,
    report: report
}
