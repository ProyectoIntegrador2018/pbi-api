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

    Locker.findOne({ 'dresser': _dress, 'campus': _camp }).then(function (locker) {
        if (locker)
            return res.status(400).send({ error: 'Ya existe un conjunto de casilleros con esas especificaciones' })

        var locker = new Locker({
            campus: _camp,
            dresser: _dress,
            count: _cnt,
            lockers: []
        })
        var i
        for (i = 0; i < _cnt; i++) {
            var cabin = new Cabin({
                campus: _camp,
                dresser: _dress,
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
    const _camp = req.body.campus
    const _dress = req.body.dresser
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

    const locker = await Locker.findOne({ 'dresser': _dress, 'campus': _camp })
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    const _cnt = locker.count
    var search = true
    for (var i = 0; i < _cnt; i++) {
        console.log(`Entrando al for ${i}`)
        if (search) {
            console.log(`Entrando al if ${i}`)
            var _cabId = locker.lockers[i]
            console.log(`Cabina ${_cabId}`)
            var cabin = await Cabin.findById(_cabId)
            if (cabin.status == 'Disponible') {
                console.log(`Entrando al segundo if ${i}`)
                cabin.status = 'Asignado'
                cabin.assignee = _userID
                cabin.save().then(function () {
                    user.locker = _cabId
                    user.save().then(function () {
                        return res.send(cabin)
                    }).catch(function (error) {
                        return res.status(505).send({ error: 'Error en save User' })
                    })
                }).catch(function (error) {
                    return res.status(505).send({ error: 'Error en save User' })
                })
                search = false
            }
        }
    }

    if (search) {
        return res.status(404).send({ error: 'No hay casilleros disponibles' })
    }


    // const user = User.findById(_userID).then(function(user){
    // 	if(!user){
    // 		
    //     }
    // 	if(user.locker){
    // 		

    // const locker = Lockerf
    // 	Locker.findOne({'dresser': _dress, 'campus': _camp}).then(function(locker){
    // 		if(!locker){
    // 			return res.status(404).send({error: 'No hay casilleros con esas especificaciones'})
    //         }
    //         console.log(locker)
    //         const cnt = locker.count
    //         var i = 0
    //         var search = true
    // 		for(i=0; i<cnt; i++){
    //             console.log(`Entrando al for ${i}`)
    //             if(search){
    //                 var _cabID = locker.lockers[i]
    //                 console.log(_cabID)
    //                 Cabin.findById(_cabID).then(function(cabin){
    //                     if(!cabin){
    //                         return res.status(404).send({error: 'No hay cabinas disponibles'})
    //                     }
    //                     if(cabin.status == 'Disponible' && search){
    //                         console.log(`Entrando al if ${i}`)
    //                         search = false
    //                         cabin.assignee = _userID
    //                         cabin.status = 'Asignado'
    //                         cabin.save().then(function(){
    //                             user.locker = cabin._id
    //                             user.save().then(function(){
    //                                 return res.send(cabin)
    //                             }).catch(function(error){
    //                                 return res.status(505).send({error: 'Error en save User'})
    //                             })
    //                         })
    //                     }
    //                 })
    //             }
    //         }
    //         if(search){
    //             return res.status(404).send({error: 'No hay casilleros disponibles'})
    //             // Agregar a lista de espera
    //         }
    // 	}).catch(function(error){
    // 		return res.status(505).send({error: 'Error en buscar casillero'})
    // 	})
    // }).catch(function(error){
    // 	return res.status(505).send({error: 'Error en buscar usuario'})
    // })
}

const unassignLocker = function (req, res) {
    const _camp = req.body.campus
    const _dress = req.body.dresser
    const _lockID = req.params.id
    var _userID
    if (req.user) {
        _userID = req.user._id
    } else {
        _userID = req.body.id
    }
    console.log(_userID)
    User.findByIdAndUpdate(_userID, { locker: null }).then(function (user) {
        if (!user) {
            return res.status(404).send({ error: `El usuario con id ${_userID} no existe.` })
        }
        Locker.findByIdAndUpdate(_lockID, { assignee: null, status: 'Disponible' }).then(function (locker) {
            if (!locker) {
                return res.status(404).send({ error: `El casillero con id ${_lockID} no existe.` })
            }
            return res.send(locker)
        }).catch(function (error) {
            return res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        return res.status(505).send({ error: error })
    })
}

// const assignByAdmin = function(req, res){
//	 const _
//}

// const unassignByAdmin = function(req, res){

//}

const switchStatus = function (req, res) {
    const _lockID = req.params.id
    Locker.findById(_lockID).then(function (locker) {
        if (!locker) {
            return res.status(404).send({ error: `No se encontró casillero con id ${_lockID}` })
        }
        if (locker.status == 'Disponible') {
            Locker.findByIdAndUpdate(_lockID, { status: 'Deshabilitado' }).then(function (locker) {
                if (!locker) {
                    return res.status(404).send({ error: `No se encontró casillero con id ${_lockID}` })
                }
                return res.send(locker)
            }).catch(function (error) {
                res.status(505).send({ error: error })
            })
        }
        if (locker.status == 'Deshabilitado') {
            Locker.findByIdAndUpdate(_lockID, { status: 'Disponible' }).then(function (locker) {
                if (!locker) {
                    return res.status(404).send({ error: `No se encontró casillero con id ${_lockID}` })
                }
                return res.send(locker)
            }).catch(function (error) {
                res.status(505).send({ error: error })
            })
        }
        if (locker.status == 'Asignado') {
            User.findOneAndUpdate({ locker: _lockID }, { locker: null }).then(function (user) {
                // if(user){
                if (true) {
                    Locker.findByIdAndUpdate(_lockID, { status: 'Deshabilitado' }).then(function (locker) {
                        if (!locker) {
                            return res.status(404).send({ error: `No se encontró casillero con id ${_lockID}` })
                        }
                        return res.send(locker)
                    }).catch(function (error) {
                        res.status(505).send({ error: error })
                    })
                } // else {}
            })
        }
    })
}

const deleteLocker = function (req, res) {
    const _lockID = req.params.id
    Locker.findByIdAndDelete(_lockID).then(function (locker) {
        if (!locker) {
            return res.status(404).send({ error: `No se encontró casillero con id ${_lockID}` })
        }
        User.findOneAndUpdate({ locker: _lockID }, { locker: null }).then(function (user) {
            if (user) {
                // Mandar correo al usuario
                console.log('El casillero tiene un usuario asignado')
                return res.send(locker)
            }
            return res.send(locker)
        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

module.exports = {
    createLocker: createLocker,
    assignLocker: assignLocker
}