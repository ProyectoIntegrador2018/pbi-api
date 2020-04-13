const Locker = require('../models/locker')
const Cabin = require('../models/cabin')
const User = require('../models/user')

if (process.env.NODE_ENV === 'production') {
    var KEY = process.env.KEY
    var EMAIL = process.env.EMAIL
    var HOST = process.env.HOST
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
} else {
    const config = require('../config')
    var KEY = config.key
    var EMAIL = config.email
    var HOST = config.host
    var MAILPORT = config.mailport
    var SECURE = config.securehost
}

const createLocker = function (req, res) {
    const _camp = req.body.campus
    const _dress = req.body.dresser
    const _cnt = req.body.count
    const _cst = req.body.cost

    Locker.findOne({ 'dresser': _dress, 'campus': _camp }).then(function (locker) {
        if (locker)
            return res.status(400).send({ error: 'Ya existe un conjunto de casilleros con esas especificaciones' })

        var locker = new Locker({
            campus: _camp,
            dresser: _dress,
            count: _cnt,
            cost = _cst,
            lockers: []
        })
        var i
        for (i = 0; i < _cnt; i++) {
            var cabin = new Cabin({
                campus: _camp,
                dresser: _dress,
                cost = _cst,
                number: i + 1,
                status: 'Disponible'
            })
            cabin.save().then(
                locker.lockers.push(cabin)
            )
        }
        locker.save().then(function () {
            return res.send(locker)
        }).catch(function (error) {
            return res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        return res.status(505).send({ error: error })
    })
}

const assignLocker = async function (req, res) {
    const _lockID = req.params.id
    var _userID
    if (req.user) {
        _userID = req.user._id
    } else {
        _userID = req.body.id
    }

    const user = await User.findById(_userID)
    if (!user) {
        return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
    }
    if (user.locker) {
        return res.status(400).send({ error: 'El usuario con ya cuenta con un casillero' })
    }

    const locker = await Locker.findById(_lockID)
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    const _cnt = locker.count
    var search = true
    for (var i = 0; i < _cnt; i++) {
        if (search) {
            var _cabID = locker.lockers[i]
            var cabin = await Cabin.findById(_cabID)
            if (!cabin) {
                return res.status(404).send({ error: 'No hay casilleros disponibles' })
            }
            if (cabin.status == 'Disponible') {
                cabin.status = 'Asignado'
                cabin.assignee = _userID
                cabin.save().then(function () {
                    user.locker = _cabID
                    user.save().then(function () {
                        return res.send(cabin)
                    }).catch(function (error) {
                        return res.status(505).send({ error: error })
                    })
                }).catch(function (error) {
                    return res.status(505).send({ error: error })
                })
                search = false
            }
        }
    }
    if (search) {
        return res.status(404).send({ error: 'No hay casilleros disponibles' })
    }
}

const unassignLocker = async function (req, res) {
    const _cabID = req.params.id
    var _userID
    if (req.user) {
        _userID = req.user._id
    } else {
        _userID = req.body.id
    }

    user = await User.findById(_userID)
    if (!user) {
        return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
    }

    cabin = await Cabin.findById(_cabID)
    if (!cabin) {
        return res.status(404).send({ error: `El casillero con id ${_cabID} no existe` })
    }

    user.locker = null
    user.save().then(function () {
        cabin.status = 'Disponible'
        cabin.assignee = null
        cabin.save().then(function () {
            return res.send(cabin)
        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

// const assignByAdmin = function(req, res){
//	 const _
//}

// const unassignByAdmin = function(req, res){

//}

const switchStatus = async function (req, res) {
    const _cabID = req.params.id

    var cabin = await Cabin.findById(_cabID)
    if (!cabin) {
        return res.status(404).send({ error: `No se encontró casillero con id ${_cabID}` })
    }
    if (cabin.status == 'Disponible') {
        cabin.status = 'Deshabilitado'
        
    } else{
        if (cabin.status == 'Deshabilitado') {
            cabin.status = 'Disponible'
        } else{
            if (cabin.status == 'Asignado') {
                var user = await User.findById(cabin.assignee)
                if (user) {
                    // Mandar 
                    console.log("El casillero tienen un usuario asignado.")
                    user.locker = null
                    user.save().then(function () {
                        cabin.status = 'Disponible'
                        cabin.assignee = null
                    }).catch(function (error) {
                        res.status(505).send({ error: error })
                    })
                } else {
                    cabin.status = 'Disponible'
                }
            }
        }
    }
    cabin.save().then(function () {
        return res.send(cabin)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const deleteLocker = async function (req, res) {
    const _lockID = req.params.id
    locker = await Locker.findByIdAndDelete(_lockID)
    if (!locker) {
        return res.status(404).send({ error: `El conjunto de casilleros con id ${_lockID} no existe` })
    }

    _cnt = locker.count
    for (var i = 0; i < _cnt; i++) {
        var _cabID = locker.lockers[i]
        var cabin = await Cabin.findByIdAndDelete(_cabID)
        if (!cabin) {
            return res.status(404).send({ error: 'No hay casilleros disponibles' })
        }
        if(cabin.assignee){
            var _userID = cabin.assignee
            user = await User.findById(_userID)
            if (!user) {
                return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
            }
            user.locker = null
            user.save().then(function(){
                // Mandar correo al usuario
                console.log(`El casillero con id ${_cabID} estaba asignado al usuario con id ${_userID}`)
            })
        }
    }

    return res.send(locker)
}



module.exports = {
    createLocker: createLocker,
    assignLocker: assignLocker,
    unassignLocker: unassignLocker,
    switchStatus: switchStatus,
    deleteLocker: deleteLocker
}