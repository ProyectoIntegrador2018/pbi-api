const Nutritionist = require('../models/nutritionist')
const Record = require('../models/record')
// const bcrypt = require('bcryptjs')

if (process.env.NODE_ENV === 'production') {
    var KEY = process.env.KEY;
    var EMAIL = process.env.EMAIL;
    var frontURL = process.env.FRONTURL
    var HOST = process.env.HOST
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
    var SECRET = process.env.SECRET
} else {
    const config = require('../config')
    var KEY = config.key;
    var EMAIL = config.email;
    var frontURL = config.frontURL
    var HOST = config.host
    var MAILPORT = config.mailport
    var SECURE = config.securehost
    var SECRET = config.secret
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

// const changePassword = function (req, res) {
//     const _id = req.params.id
//     var _pwd = req.body.password
    
//     console.log(_pwd)
//     bcrypt.hash(_pwd, SECRET).then(function(hash){
//         _pwd = hash
//         console.log(_pwd)
//         Nutritionist.findByIdAndUpdate(_id, {password: _pwd}).then(function(nutritionist){
//             if (!nutritionist) {
//                 return res.status(404).send({ error: `El nutriólogo con id ${_id} no existe` })
//             }
//             return res.send(nutritionist)
//         })
//     }).catch(function (error) {
//         return res.status(505).send({ error: error })
//     })
// }

// const updateNutritionistAdmin = function (req, res) {
//     const _id = req.nutritionist.id
// }

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

module.exports = {
    createNutritionist: createNutritionist,
    getNutritionists: getNutritionists,
    getNutritionist: getNutritionist,
    // changePassword:changePassword,
    login: login,
    logout: logout,
    deleteNutritionist: deleteNutritionist
}