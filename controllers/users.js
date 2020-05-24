const User = require('../models/user')
const Class = require('../models/class')

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

const getUsers = function (req, res) {
    User.find({}).then(function (users) {
        res.send(users)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const getUser = function (req, res) {
    const _id = req.params.id
    User.findById(_id).exec(function (user) {
        if (!user) {
            return res.status(404).send({ error: `El usuario con id ${_id} no existe` })
        }
        return res.send(user)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const createUser = function (req, res) {
    const user = new User(req.body)
    user.save().then(function () {
        user.generateConfirmToken().then(function (token) {
            console.log(token)
            //mailing(req.body.nomina,req.body.email,token)
            //return res.send(token)
            return res.send(user)
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
    User.findByCredentials(req.body.email, req.body.password).then(function (user) {
        //if (user.confirmToken != "Confirmed") {
        if (false) {
            return res.status(401).send({ error: "No has confirmado tu cuenta, verifica tu correo electrónico", type: 2 })
        }
        user.generateToken().then(function (token) {
            return res.send({ user, token })
        }).catch(function (error) {
            return res.status(401).send({ error: "Usuario o contraseña inválidoss", type: 1 })
        })
    }).catch(function (error) {
        return res.status(401).send({ error: error, type: 1 })
    })
}

const logout = function (req, res) {
    req.user.tokens = req.user.tokens.filter(function (token) {
        return token.token !== req.token
    })
    req.user.save().then(function () {
        return res.send(true)
    }).catch(function (error) {
        return res.status(500).send({ error: error })
    })
}

const updateUser = function (req, res) {
    const _id = req.user._id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surename', 'departamento', 'rectoria', 'password', 'age', 'insurancecompany', 'securitynumber',
        'hospital', 'contactname', 'contactphone', 'contactrelationship', 'illnesses', 'flagrecentinjury',
        'injuryindication', 'flagmedicine',
        'medicineindication', 'physicalcondition']

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    User.findByIdAndUpdate(_id, req.body).then(function (user) {
        if (!user) {
            return res.status(404).send()
        }
        return res.send(user)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const fillMedicalRecord = function (req, res) {
    const _id = req.user._id
    User.findOneAndUpdate({ _id: _id }, { $set: { medicalRecord: req.body, filledRecord: true } }).then(function (user) {
        if (!user) {
            return res.status(404).send()
        }
        return res.send(user)
    }).catch(function (error) {
        console.log(error)
        res.status(500).send({ error: error })
    })
}

const fillMedicalRecordAdmin = function (req, res) {
    const _id = req.params.id
    User.findOneAndUpdate({ _id: _id }, { $set: { medicalRecord: req.body, filledRecord: true } }).then(function (user) {
        if (!user) {
            return res.status(404).send()
        }
        return res.send(user)
    }).catch(function (error) {
        console.log(error)
        res.status(500).send({ error: error })
    })
}

const updateUserByAdmin = function (req, res) {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surename', 'departamento', 'rectoria', 'password', 'age', 'insurancecompany', 'securitynumber', 'hospital', 'contactname', 'contactphone', 'contactrelationship', 'illnesses', 'flagrecentinjury', 'injuryindication', 'flagmedicine',
        'medicineindication', 'physicalcondition']

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    User.findByIdAndUpdate(_id, req.body).then(function (user) {
        if (!user) {
            return res.status(404).send()
        }
        return res.send(user)
    }).catch(function (error) {
        res.status(500).send({ error: error })
    })
}

const deleteUser = function (req, res) {
    const _id = req.params.id

    User.findById(_id).then(function (user) {
        if (!user) {
            return res.status(404).send()
        }
        Class.find({ "_id": { $in: user.classes } }).then((classes) => {
            classes.forEach(function (clase) {

                clase.enrolled = clase.enrolled.filter(function (value, index, arr) {
                    return !(String(value) === String(user._id))
                })
                clase.save().catch(() => {
                    res.status(400).send({ error: "Hubo un error al eliminar las clases del usuario eliminado" })
                })
            })
            user.deleteOne({ _id: req.params.id }).then((_) => {
                return res.send(user)
            }).catch(() => {
                res.status(400).send({ error: "Hubo un error al eliminadr el usuario" })
            })
        })
    }).catch(function (error) {
        res.status(505).send(error)
    })
}

const userConfirm = function (req, res) {
    const token = req.query.token
    if (token) {
        User.confirmUser(token).then(function (user) {
            return res.send("OK")
        }).catch(function (error) {
            return res.status(401).send({ error: error })
        })
    } else {
        return res.status(401).send({ error: "Link de confirmación inválido" })
    }
}

const resendConfirm = function (req, res) {
    const email = req.body.email
    User.findOne({ "email": email }).then(function (user) {
        if (user.confirmToken == "Confirmed") {
            return res.status(400).send({ error: "Esta cuenta ya está confirmada" })
        }
        user.generateConfirmToken().then(function (token) {
            mailing(user.nomina, user.email, token)
            return res.send("OK")
        }).catch(function (error) {
            return res.status(400).send({ error: "No se pudo envíar el correo de confirmación" })
        })
    }).catch(function (error) {
        return res.status(400).send({ error: "No hay una cuenta registrada con el e-mail introducido" })
    })
}

const requestResetPassword = function (req, res) {
    const email = req.body.email
    User.findOne({ "email": email }).then(function (user) {
        user.generateResetToken().then(function (token) {
            mailResetPassword(email, token)
            return res.send("OK")
        }).catch(function (error) {
            return res.status(400).send({ error: "No se pudo enviar el correo de cambio de contraseña" })
        })
    }).catch(function (error) {
        return res.status(400).send({ error: "No hay una cuanta registrada con el e-mail introducido" })
    })
}

const getUserOnResetP = function (req, res) {
    const token = req.query.token
    console.log(token)
    if (token) {
        User.getUserOnTokenPass(token).then(function (user) {
            return res.send(user)
        }).catch(function (error) {
            return res.status(400).send({ error: error })
        })
    } else {
        return res.status(400).send({ error: "Enlace inválido" })
    }
}

const resetPassword = function (req, res) {
    const token = req.body.token
    const password = req.body.password
    if (token) {
        User.resetPassword(token, password).then(function (_) {
            return res.send("OK")
        }).catch(function (error) {
            return res.status(400).send({ error: error })
        })
    } else {
        return res.status(400).send({ error: "Enlace inválido" })
    }
}

// const validateSession = function (req, res) {
//     const token = req.query.token
//     User.validateToken(token).then(function (data) {
//         return res.send(data)
//     }).catch(function () {
//         return res.send(false)
//     })
// }

const getAttendance = function (req, res) {
    const _classID = req.params.id
    var _userID
    if (req.user) {
        _userID = req.user.id
    } else {
        _userID = req.query.id
    }
    User.findById(_userID).then(function (user) {
        if (!user) {
            return res.status(404).send({ error: `El usuario con id ${_userID} no existe` })
        }
        for (const course in user.attendance) {
            if (course == _classID) {
                return res.send(course)
            }
        }
        return res.status(404).send({ error: `El usuario no está registrado en el curso con id ${_classID}` })
    })
}

module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    login: login,
    logout: logout,
    createUser: createUser,
    updateUser: updateUser,
    fillMedicalRecord: fillMedicalRecord,
    fillMedicalRecordAdmin: fillMedicalRecordAdmin,
    updateUserByAdmin: updateUserByAdmin,
    deleteUser: deleteUser,
    userConfirm: userConfirm,
    resendConfirm: resendConfirm,
    requestResetPassword: requestResetPassword,
    resetPassword: resetPassword,
    getUserOnResetP: getUserOnResetP,
    // validateSession: validateSession,
    getAttendance: getAttendance
}


function mailing(nomina, correo, token) {
    const nodemailer = require('nodemailer')
    const mailTransport = nodemailer.createTransport({
        host: HOST,
        port: MAILPORT,
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
        subject: "Confirmar cuenta",
        html: `</style>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <b style="font-size:12pt; font-style:inherit; font-variant-ligatures:inherit; font-variant-caps:inherit">Gracias por registrarse al Sistema de Inscripciones PBI!</b><br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <span><br>
        </span></div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        Para completar el registro de la nómina: <i><u>${nomina}</u></i> , favor de seguir las siguientes instrucciones:<br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <span><br>
        </span></div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <ul>
        <li><span style="font-size:16pt">Haz click </span><a href="${frontURL}/confirm?token=${token}" target="_blank" title="Haz clic para confirmar cuenta"><span style="font-size:16pt">aquí</span></a><span style="font-size:16pt"> para completar tu
        registro.</span></li></ul>
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
</div></div>`
    }, (error, info) => {
        if (error) {
            console.log("Ocurrió un error");
            console.log(error.message);
            return;
        }

        console.log("message sent succesfully")
    })
}

function mailResetPassword(correo, token) {
    const nodemailer = require('nodemailer')
    const mailTransport = nodemailer.createTransport({
        host: HOST,
        port: MAILPORT,
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
        subject: "Reestablecer Contraseña",
        html: `</style>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <b style="font-size:12pt; font-style:inherit; font-variant-ligatures:inherit; font-variant-caps:inherit">Has solicitado cambiar la contraseña de tu cuenta del Sistema de Inscripciones PBI</b><br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <span><br>
        </span></div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        Para completar el cambio de contraseña favor de seguir las siguientes instrucciones:<br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <span><br>
        </span></div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <ul>
        <li><span style="font-size:16pt">Haz click </span><a href="${frontURL}/newpassword?token=${token}" target="_blank" title="Reestablecer contrseña"><span style="font-size:16pt">aquí</span></a><span style="font-size:16pt"> para continuar.</span></li></ul>
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
</div></div>`
    }, (error, info) => {
        if (error) {
            console.log("Ocurrió un error");
            console.log(error.message);
            return;
        }

        console.log("message sent succesfully")
    })
}
