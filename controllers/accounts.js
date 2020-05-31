const Account = require('../models/account')
const User = require('../models/user')
const Admin = require('../models/admin')
const Professor = require('../models/professor')
const Nutritionist = require('../models/nutritionist')

const bcrypt = require('bcryptjs')

if (process.env.NODE_ENV === 'production') {
    var KEY = process.env.KEY;
    var EMAIL = process.env.EMAIL;
    var frontURL = process.env.FRONTURL
    var HOST = process.env.HOST
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
} else {
    const config = require('../config')
    var KEY = config.key;
    var EMAIL = config.email;
    var frontURL = config.frontURL
    var HOST = config.host
    var MAILPORT = config.mailport
    var SECURE = config.securehost
}

const getAccounts = function (req, res) {
    Account.find({}).then(function (accounts) {
        return res.send(accounts)
    }).catch(function (error) {
        return res.status(500).send(error)
    })
}

const getAccount = function (req, res) {
    Account.findById(req.params.id).exec(function (account) {
        if (!account) {
            return res.status(404).send({ error: `La cuenta con id ${_id} no existe` })
        }
        return res.send(account)
    }).catch(function (error) {
        return res.status(500).send(error)
    })
}

const createAccount = async function (req, res) {
    const account = new Account(req.body)
    user = await User.findOne({ nomina: req.body.nomina })
    if (!user) {
        user = new User({
            name: req.body.name,
            surname: req.body.surname,
            nomina: req.body.nomina,
            email: req.body.email,
            departamento: req.body.departamento,
            rectoria: req.body.rectoria
        })
    }

    account.userAcc = user._id
    account.save().then(function () {
        user.account = account._id
        user.save().then(function () {
            return res.send(account)
        })
    }).catch((error) => {
        if (error.errmsg.includes("nomina")) {
            return res.status(400).send({ error: "Ya existe una cuenta con la nómina especificada" })
        } else if (error.errmsg.includes("email")) {
            return res.status(400).send({ error: "Ya existe una cuenta con el correo especificado" })
        } else {
            return res.status(400).send({ error: "Error desconocido" })
        }
    })
}

const login = function (req, res) {
    Account.findByCredentials(req.body.email, req.body.password).then(function (account) {
        account.generateToken().then(function (token) {
            return res.send({ account, token })
        }).catch(function (error) {
            return res.status(401).send({ error: "Correo o contraseña inválidos", type: 1 })
        })
    }).catch(function (error) {
        return res.status(401).send({ error: error, type: 1 })
    })
}

const logout = function (req, res) {
    req.account.tokens = req.account.tokens.filter(function (token) {
        return token.token !== req.token
    })
    req.account.save().then(function () {
        return res.send(true)
    }).catch(function (error) {
        return res.status(500).send({ error: error })
    })
}

const updateAccount = async function (req, res) {
    const _id = req.account._id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surname', 'password', 'departamento', 'rectoria']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    
    var account = await Account.findByIdAndUpdate(_id, req.body)
    if (!account) {
        return res.status(404).send(error)
    }
    
    var user = await User.findByIdAndUpdate(req.account.userAcc, req.body)
    user.save()
    if(req.account.isAdmin){
        var admin = await Admin.findByIdAndUpdate(req.account.adminAcc, req.body)
        admin.save()
    }
    if(req.account.isNutri){
        var nutritionist = await Nutritionist.findByIdAndUpdate(req.account.nutriAcc, req.body)
        nutritionist.save()
    }
    if(req.account.isProf){
        var professor = await Professor.findByIdAndUpdate(req.account.profAcc, req.body)
        professor.save()
    }
    
    const _hash = await bcrypt.hash(req.body.password, 8)
    if(_hash){
        account.password = _hash
    }

    account.save().then(function (){
        return res.send(account)
    }).catch(function (error) {
        return res.status(500).send(error)
    })
    
}

const switchAdmin = async function (req, res) {
    const _id = req.params.id

    var account = await Account.findById(_id)
    if (!account) {
        return res.status(404).send({ error: `La cuenta con id ${_id} no existe` })
    }

    var admin = await Admin.findOne({ nomina: account.nomina })

    if (!account.isAdmin) {
        if (admin) {
            admin.account = account._id
            account.adminAcc = admin._id
        } else {
            admin = new Admin({
                account: account._id,
                name: account.name,
                surname: account.surname,
                nomina: account.nomina,
                email: account.email,
                departamento: account.departamento,
                rectoria: account.rectoria
            })
            account.adminAcc = admin._id
        }
        account.isAdmin = true
        account.save().then(function () {
            admin.save().then(function () {
                return res.send(account)
            }).catch(function (error) {
                return res.status(500).send(error)
            })
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    } else {
        account.isAdmin = false
        account.adminAcc = null
        account.save().then(function () {
            return res.send(account)
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    }
}

const switchNutritionist = async function (req, res) {
    const _id = req.params.id

    var account = await Account.findById(_id)
    if (!account) {
        return res.status(404).send({ error: `La cuenta con id ${_id} no existe` })
    }

    var nutritionist = await Nutritionist.findOne({ nomina: account.nomina })

    if (!account.isNutri) {
        if (nutritionist) {
            nutritionist.account = account._id
            account.nutriAcc = nutritionist._id
        } else {
            nutritionist = new Nutritionist({
                account: account._id,
                name: account.name,
                surname: account.surname,
                nomina: account.nomina,
                email: account.email,
                departamento: account.departamento,
                rectoria: account.rectoria
            })
            account.nutriAcc = nutritionist._id
        }
        account.isNutri = true
        account.save().then(function () {
            nutritionist.save().then(function () {
                return res.send(account)
            }).catch(function (error) {
                return res.status(500).send(error)
            })
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    } else {
        account.isNutri = false
        account.nutriAcc = null
        account.save().then(function () {
            return res.send(account)
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    }
}

const switchProfessor = async function (req, res) {
    const _id = req.params.id

    var account = await Account.findById(_id)
    if (!account) {
        return res.status(404).send({ error: `La cuenta con id ${_id} no existe` })
    }

    var professor = await Professor.findOne({ nomina: account.nomina })

    if (!account.isProf) {
        if (professor) {
            professor.account = account._id
            account.profAcc = professor._id
        } else {
            professor = new Professor({
                account: account._id,
                name: account.name,
                surname: account.surname,
                nomina: account.nomina,
                email: account.email,
                departamento: account.departamento,
                rectoria: account.rectoria
            })
            account.profAcc = professor._id
        }
        account.isProf = true
        account.save().then(function () {
            professor.save().then(function () {
                return res.send(account)
            }).catch(function (error) {
                return res.status(500).send(error)
            })
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    } else {
        account.isProf = false
        account.profAcc = null
        account.save().then(function () {
            return res.send(account)
        }).catch(function (error) {
            return res.status(500).send(error)
        })
    }
}

const validateSession = function (req, res) {
    const token = req.query.token
    Account.validateToken(token).then(function (data) {
        return res.send(data)
    }).catch(function () {
        return res.send(false)
    })
}

module.exports = {
    getAccounts: getAccounts,
    getAccount: getAccount,
    createAccount: createAccount,
    login: login,
    logout: logout,
    updateAccount: updateAccount,
    switchAdmin: switchAdmin,
    switchNutritionist: switchNutritionist,
    switchProfessor: switchProfessor,
    validateSession: validateSession
}