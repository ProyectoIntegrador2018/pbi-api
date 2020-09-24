const jwt = require('jsonwebtoken')

const Account = require('../models/account')
const User = require('../models/user')
const Admin = require('../models/admin')
const Professor = require('../models/professor')
const Nutritionist = require('../models/nutritionist')
const {SECRET} = require('../config');

const auth = function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)

        Account.findOne({ _id: decoded._id, 'tokens.token': token }).then(function (account) {
            if (!account) {
                throw new Error()
            }
            req.token = token
            req.account = account
            next()
        }).catch(function (error) {
            res.status(401).send({ error: 'Favor de iniciar sesión' })
        })
    } catch (e) {
        res.status(401).send({ error: 'Favor de iniciar sesión' })
    }
}

const authUser = function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)

        Account.findOne({ _id: decoded._id, 'tokens.token': token }).then(function (account) {
            if (!account) {
                throw new Error()
            }
            User.findOne({ _id: account.userAcc }).then(function (user) {
                req.token = token
                req.user = user
                next()
            }).catch(function (error) {
                res.status(403).send({ error: 'No tiene acceso a esta sección' })
            })

        }).catch(function (error) {
            res.status(401).send({ error: 'Favor de iniciar sesión' })
        })
    } catch (e) {
        res.status(401).send({ error: 'Favor de iniciar sesión' })
    }
}

const authAdmin = function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)

        Account.findOne({ _id: decoded._id, 'tokens.token': token }).then(function (account) {
            if (!account) {
                throw new Error()
            }
            Admin.findOne({ _id: account.adminAcc }).then(function (admin) {
                req.token = token
                req.admin = admin
                next()
            }).catch(function (error) {
                res.status(403).send({ error: 'No tiene acceso a esta sección' })
            })

        }).catch(function (error) {
            res.status(401).send({ error: 'Favor de iniciar sesión' })
        })
    } catch (e) {
        res.status(401).send({ error: 'Favor de iniciar sesión' })
    }
}

const authNutri = function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)

        Account.findOne({ _id: decoded._id, 'tokens.token': token }).then(function (account) {
            if (!account) {
                throw new Error()
            }
            Nutritionist.findOne({ _id: account.nutriAcc }).then(function (nutritionist) {
                req.token = token
                req.nutritionist = nutritionist
                next()
            }).catch(function (error) {
                res.status(403).send({ error: 'No tiene acceso a esta sección' })
            })

        }).catch(function (error) {
            res.status(401).send({ error: 'Favor de iniciar sesión' })
        })
    } catch (e) {
        res.status(401).send({ error: 'Otro error' })
    }
}

const authProf = function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)

        Account.findOne({ _id: decoded._id, 'tokens.token': token }).then(function (account) {
            if (!account) {
                throw new Error()
            }
            Professor.findOne({ _id: account.profAcc }).then(function (professor) {
                req.token = token
                req.professor = professor
                next()
            }).catch(function (error) {
                res.status(403).send({ error: 'No tiene acceso a esta sección' })
            })

        }).catch(function (error) {
            res.status(401).send({ error: 'Favor de iniciar sesión' })
        })
    } catch (e) {
        res.status(401).send({ error: 'Favor de iniciar sesión' })
    }
}


module.exports = {
    auth: auth,
    authUser: authUser,
    authAdmin: authAdmin,
    authNutri: authNutri,
    authProf: authProf
}
