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
            cost: _cst,
            lockers: []
        })
        var i
        for (i = 0; i < _cnt; i++) {
            var cabin = new Cabin({
                campus: _camp,
                dresser: _dress,
                cost: _cst,
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

const getLockers = function (req, res) {
    Locker.find().populate('lockers').then(function (lockers) {
        return res.send(lockers)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const getLockerByID = function (req, res) {
    const _id = req.params.id
    Locker.findById(_id).populate('lockers').then(function (locker) {
        if (!locker) {
            return res.status(404).send({ error: `El conjunto de casilleros con id ${_id} no existe` })
        }
        return res.send(locker)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const getLockerBySpecs = function (req, res) {
    const _camp = req.query.campus
    const _dress = req.query.dresser
    Locker.findOne({ campus: _camp, dresser: _dress }).populate('lockers').then(function (locker) {
        if (!locker) {
            return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
        }
        return res.send(locker)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const getCabin = function (req, res) {
    const _cabID = req.params.id
    Cabin.findById(_cabID).then(function (cabin) {
        if (!cabin) {
            return res.status(404).send({ error: `El casillero con id ${_cabID} no existe` })
        }
        return res.send(cabin)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const changeCost = async function (req, res) {
    const _lockID = req.params.id
    const _cst = req.body.cost

    var locker = await Locker.findByIdAndUpdate(_lockID, { cost: _cst })
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    for (var i = 0; i < locker.count; i++) {
        var cabin = await Cabin.findByIdAndUpdate(locker[i], { cost: _cst })
        if (!cabin) {
            return res.status(404).send({ error: `El casillero con id ${_cabID} no existe` })
        }
        cabin.save().then(function () {
        
        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
    }
    locker.save().then(function () {
        req.send(locker)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const addCabins = async function (req, res) {
    const _lockID = req.params.id
    const _add = req.body.add

    var locker = await Locker.findByIdAndUpdate(_lockID, { $inc: { count: _add } })
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    const _curr = locker.count
    const _camp = locker.campus
    const _dress = locker.dresser
    const _cst = locker.cost

    for (var i = 0; i < _add; i++) {
        const cabin = new Cabin({
            campus: _camp,
            dresser: _dress,
            cost: _cst,
            number: _curr + i + 1,
            status: 'Disponible',
            assignee: null
        })
        cabin.save().then(function () {

        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
        locker.lockers.push(cabin._id)
    }
    locker.save().then(function () {
        return res.send(locker)
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

const removeCabins = async function (req, res) {
    const _lockID = req.params.id
    const _subs = req.body.substract

    var locker = await Locker.findByIdAndUpdate(_lockID, { $inc: { count: -_subs } })
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    const _curr = locker.count

    for (var i = _curr - 1; i >= _curr - _subs; i--) {
        var _cabID = locker.lockers.pop()
        var cabin = await Cabin.findByIdAndDelete(_cabID)
        if (!cabin) {
            return res.status(404).send({ error: `El casillero con id ${_cabID} no existe` })
        }
        if (cabin.assignee) {
            var _userID = cabin.assignee
            var user = await User.findById(_userID)
            if (!user) {
                return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
            }
            // Mandar correo confirmacion
            user.locker = null
            user.save().then(function () {
               // Mandar correo confirmacion
            })
        }

    }
    locker.save().then(function () {
        return res.send(locker)
    }).catch(function (error) {
        res.status(505).send({ error: error })
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
        return res.status(400).send({ error: 'El usuario ya cuenta con un casillero' })
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
    if (String(user._id) != String(cabin.assignee)) {
        return res.status(400).send({ error: `El casillero no pertenece al usuario que desea desasignarse` })
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

    } else {
        if (cabin.status == 'Deshabilitado') {
            cabin.status = 'Disponible'
        } else {
            if (cabin.status == 'Asignado') {
                var user = await User.findById(cabin.assignee)
                if (user) {
                    // Mandar 
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
        if (cabin.assignee) {
            var _userID = cabin.assignee
            user = await User.findById(_userID)
            if (!user) {
                return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
            }
            user.locker = null
            user.save().then(function () {
                // Mandar correo al usuario
                //(`El casillero con id ${_cabID} estaba asignado al usuario con id ${_userID}`)
            })
        }
    }

    return res.send(locker)
}

module.exports = {
    createLocker: createLocker,
    getLockers: getLockers,
    getLockerByID: getLockerByID,
    getLockerBySpecs: getLockerBySpecs,
    getCabin: getCabin,
    changeCost: changeCost,
    addCabins: addCabins,
    removeCabins: removeCabins,
    assignLocker: assignLocker,
    unassignLocker: unassignLocker,
    switchStatus: switchStatus,
    deleteLocker: deleteLocker
}