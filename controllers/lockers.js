const Locker = require('../models/locker')
const Cabin = require('../models/cabin')
const User = require('../models/user')
const {
    EMAIL,
    HOST,
    KEY,
    MAIL_PORT
} = require('../config');

if (process.env.NODE_ENV === 'production') {
    var SECURE = process.env.SECUREHOST
} else {
    const config = require('../config')
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
        var cabin = await Cabin.findByIdAndUpdate(locker.lockers[i], { cost: _cst })
        if (!cabin) {
            return res.status(404).send({ error: `El casillero con id ${locker.lockers[i]} no existe` })
        }
        cabin.cost = locker.cost
        cabin = await cabin.save().catch(function (error) {
            return res.status(505).send({ error: error })
        })
    }
    locker.save().then(function () {
        return res.send(locker)
    }).catch(function (error) {
        return res.status(505).send({ error: error })
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
            return res.send(cabin)
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
            cancelCabinMail(user.name, user.email, user.nomina, cabin)
            user.locker = null
            user.save()
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
    const _userID = req.user._id


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
                        mailing(user.name, user.email, user.nomina, cabin)
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

const assignCabin = async function (req, res) {
    const _cabID = req.params.id
    const _userID = req.body.id

    const user = await User.findOne({nomina:_userID})
    if (!user) {
        return res.status(404).send({ error: `El usuario con Nómmina ${_userID} no existe` })
    }
    if (user.locker) {
        return res.status(400).send({ error: 'El usuario ya cuenta con un casillero' })
    }

    var cabin = await Cabin.findById(_cabID)
    if (!cabin) {
        return res.status(404).send({ error: 'No hay casilleros disponibles' })
    }
    if(cabin.assignee){
        return res.status(400).send({ error: 'El casillero ya se encuentra asignado a un usuario' })
    }

    if (cabin.status == 'Disponible') {
        cabin.status = 'Asignado'
        cabin.assignee = user._id
        cabin.save().then(function () {
            user.locker = _cabID
            user.save().then(function () {
                mailing(user.name, user.email, user.nomina, cabin)
                return res.send(cabin)
            }).catch(function (error) {
                return res.status(505).send({ error: error })
            })
        }).catch(function (error) {
            return res.status(505).send({ error: error })
        })
    }
}

const unassignLocker = async function (req, res) {
    const _cabID = req.params.id
    var _userID
    if (req.user) {
        _userID = req.user._id
    } else if (req.admin) {
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
            cancelCabinMail(user.name, user.email, user.nomina, cabin)
            return res.send(cabin)
        }).catch(function (error) {
            res.status(505).send({ error: error })
        })
    }).catch(function (error) {
        res.status(505).send({ error: error })
    })
}

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
                    var result
                    user.locker = null
                    result = user.save().catch(function (error) {
                        res.status(505).send({ error: error })
                    })
                    if (result) {
                        cabin.status = 'Disponible'
                        cabin.assignee = null
                        cancelCabinMail(user.name, user.email, user.nomina, cabin)
                    }
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
                cancelCabinMail(user.name, user.email, user.nomina, cabin)
                return res.send(`El casillero con id ${_cabID} estaba asignado al usuario con id ${_userID} y se le ha desasignado`)
            })
        }
    }
    return res.send(locker)
}

const emptyLocker = async function (req, res) {
    const _lockID = req.params.id
    var locker = await Locker.findById(_lockID)
    if (!locker) {
        return res.status(404).send({ error: 'No hay casilleros con esas especificaciones' })
    }

    const _cnt = locker.count
    for (var i = 0; i < _cnt; i++) {
        var _cabID = locker.lockers[i]
        var cabin = await Cabin.findById(_cabID)
        if (!cabin) {
            return res.status(404).send({ error: 'No hay casilleros disponibles' })
        }
        if (cabin.status == 'Asignado') {
            var user = await User.findById(cabin.assignee)
            if (!user) {
                return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
            }
            cabin.status = 'Disponible'
            cabin.assignee = null
            cabin.save().then(function () {
                user.locker = null
                user.save().then(function () {
                    cancelCabinMail(user.name, user.email, user.nomina, cabin)
                }).catch(function (error) {
                    return res.status(505).send({ error: error })
                })
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
    assignCabin: assignCabin,
    unassignLocker: unassignLocker,
    switchStatus: switchStatus,
    deleteLocker: deleteLocker,
    emptyLocker: emptyLocker
}


function mailing(name, correo, nomina, locker) {
    try {
        const nodemailer = require('nodemailer')
        const mailTransport = nodemailer.createTransport({
            host: HOST,
            port: MAIL_PORT,
            secure: SECURE,
            auth: {
                user: EMAIL,
                pass: KEY
            },
            tls: {
                rejectUnauthorized: false
            }
        })


        const info = mailTransport.sendMail({
            from: `Inscripciones PBI <${EMAIL}>`,
            //bcc: "", para una lista de remitentes
            to: correo,
            subject: "Reservación de Casillero",
            html: `</style>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <b style="font-size:12pt; font-style:inherit; font-variant-ligatures:inherit; font-variant-caps:inherit">
                    PBI - Confirmación de Reservación de Casillero
                </b><br>
            </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <span><br>
                </span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <i><u>${name}</u></i>, <i><u>${nomina}</u></i> , has reservado un casillero:<br>
            </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <span><br>
                </span></div>
                <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <ul>
                    <li><span style="font-size:16pt">Vestidor Seleccionado: ${locker.dresser}</li>
                    <li><span style="font-size:16pt">Número de casillero: ${locker.number}</span></li>
                    <li><span style="font-size:16pt">Costo: ${"$" + locker.cost}</span></li>
                </ul>
                </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><br>
            </span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><span>Atentamente&nbsp;</span></span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><span> <img src="http://web7.mty.itesm.mx/temporal/pbi/bienestar.gif" alt="Programa de Bienestar Integral" width="165"
            height="136"></span></span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            </span><span>Coordinación del Programa de Bienestar Integral</span><br>
            <p class="x_MsoNormal"><span style="font-size:14.0pt; color:#002060">Lic. Sandra Nohemí Ramos Hernández</span><span style="font-size:14.0pt; font-family:&quot;Times New Roman&quot;,serif; color:#002060"></span></p>
    <p class="x_MsoNormal"><b><span style="color:#0070C0">Coordinación del Programa Bienestar Integral</span></b><span style="color:#1F497D"></span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Bienestar Integral</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">LIFE</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Campus Monterrey</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Tecnológico de Monterrey</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Tel. 52 (8</span><span lang="EN-US" style="color:#1F497D">1) 8358 - 2000; ext. 3651</span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D">&nbsp;</span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D"><a href="http://tecdeportes.mty.itesm.mx/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"><span lang="ES-MX" style="color:#1155CC">http://tecdeportes.mty.itesm.mx/</span></a></span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D"><a href="mailto:pbi.mty@servicios.itesm.mx" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"><span style="color:blue">pbi.mty@servicios.itesm.mx</span></a></span></p>
    <p class="x_MsoNormal">&nbsp;</p>
    </div>
            </div>`
        }, (error, info) => {
            if (error) {
                console.log("Ocurrió un error");
                console.log(error.message);
                return;
            }

            console.log("message sent succesfully")
        })
    } catch (error) {
        console.log(error)
    }
}

function cancelCabinMail(name, correo, nomina, locker) {
    try {
        const nodemailer = require('nodemailer')
        const mailTransport = nodemailer.createTransport({
            host: HOST,
            port: MAIL_PORT,
            secure: SECURE,
            auth: {
                user: EMAIL,
                pass: KEY
            },
            tls: {
                rejectUnauthorized: false
            }
        })


        const info = mailTransport.sendMail({
            from: `Inscripciones PBI <${EMAIL}>`,
            //bcc: "", para una lista de remitentes
            to: correo,
            subject: "Cancelación de Reservación de Casillero",
            html: `</style>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <b style="font-size:12pt; font-style:inherit; font-variant-ligatures:inherit; font-variant-caps:inherit">
                    PBI - Cancelación de Reservación de Casillero
                </b><br>
            </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <span><br>
                </span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <i><u>${name}</u></i>, <i><u>${nomina}</u></i> , un administrador ha cancelado tu reservación de tu casillero:<br>
            </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <span><br>
                </span></div>
                <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
                <ul>
                    <li><span style="font-size:16pt">Vestidor: ${locker.dresser}</li>
                    <li><span style="font-size:16pt">Número de casillero: ${locker.number}</span></li>
                </ul>
                </div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><br>
            </span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><span>Si crees que esto ha sido un herro favor de ponerse en contacto. Atentamente&nbsp;</span></span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><span> <img src="http://web7.mty.itesm.mx/temporal/pbi/bienestar.gif" alt="Programa de Bienestar Integral" width="165"
            height="136"></span></span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            </span><span>Coordinación del Programa de Bienestar Integral</span><br>
            <p class="x_MsoNormal"><span style="font-size:14.0pt; color:#002060">Lic. Sandra Nohemí Ramos Hernández</span><span style="font-size:14.0pt; font-family:&quot;Times New Roman&quot;,serif; color:#002060"></span></p>
    <p class="x_MsoNormal"><b><span style="color:#0070C0">Coordinación del Programa Bienestar Integral</span></b><span style="color:#1F497D"></span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Bienestar Integral</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">LIFE</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Campus Monterrey</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Tecnológico de Monterrey</span></p>
    <p class="x_MsoNormal"><span style="color:#1F497D">Tel. 52 (8</span><span lang="EN-US" style="color:#1F497D">1) 8358 - 2000; ext. 3651</span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D">&nbsp;</span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D"><a href="http://tecdeportes.mty.itesm.mx/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"><span lang="ES-MX" style="color:#1155CC">http://tecdeportes.mty.itesm.mx/</span></a></span></p>
    <p class="x_MsoNormal"><span lang="EN-US" style="color:#1F497D"><a href="mailto:pbi.mty@servicios.itesm.mx" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"><span style="color:blue">pbi.mty@servicios.itesm.mx</span></a></span></p>
    <p class="x_MsoNormal">&nbsp;</p>
    </div>
            </div>`
        }, (error, info) => {
            if (error) {
                console.log("Ocurrió un error");
                console.log(error.message);
                return;
            }

            console.log("message sent succesfully")
        })
    } catch (error) {
        console.log(error)
    }
}
