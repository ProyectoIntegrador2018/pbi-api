const User = require('../models/user')
const Class = require('../models/class')
const Account = require('../models/account')
const Admin = require('../models/admin')
const Nutritionist = require('../models/nutritionist')
const Professor = require('../models/professor')
const Cabin = require('../models/cabin')
const {
    EMAIL,
    HOST,
    KEY,
    MAIL_PORT,
    FRONT_URL
} = require('../config');

if (process.env.NODE_ENV === 'production') {
    var SECURE = process.env.SECUREHOST
} else {
    const config = require('../config')
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
    User.findById(_id).populate('classes').then(function (user) {
        if (!user) {
            return res.status(404).send({ error: `El usuario con id ${_id} no existe` })
        }
        return res.send(user)
    }).catch(function (error) {
        res.status(500).send(error)
    })
}

const updateUser = function (req, res) {
    const _id = req.user._id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surname', 'departamento', 'rectoria', 'password', 'age', 'insurancecompany', 'securitynumber',
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
        if (req.body.password) {

            Account.findById(user.account).then((account) => {
                account.password = req.body.password
                account.save().then(() => {
                    return res.send(user)
                })
            })
        } else {
            return res.send(user)
        }

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
        res.status(500).send({ error: error })
    })
}

const updateUserByAdmin = function (req, res) {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'surname', 'departamento', 'rectoria', 'password', 'age', 'insurancecompany', 'securitynumber', 'hospital', 'contactname', 'contactphone', 'contactrelationship', 'illnesses', 'flagrecentinjury', 'injuryindication', 'flagmedicine',
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

const deleteUser = async function (req, res) {
    const _id = req.params.id

    var user = await User.findByIdAndDelete(_id)
    if (!user) {
        return res.status(404).send({ error: `El usuario con id ${_id} no existe` })
    }

    var account = await Account.findByIdAndDelete(user.account)
    if (!account) {
        return res.status(404).send({ error: `La cuenta con id ${user.account} no existe` })
    }

    if(account.isAdmin){
        var admin = await Admin.findByIdAndDelete(account.adminAcc)
        if (!admin) {
            return res.status(404).send({ error: `El administrador con id ${account.adminAcc} no existe` })
        }
    }
    if(account.isProf){
        var professor = await Professor.findByIdAndDelete(account.profAcc)
        if (!professor) {
            return res.status(404).send({ error: `El profesor con id ${account.profAcc} no existe` })
        }
    }
    if(account.isNutri){
        var nutritionist = await Nutritionist.findByIdAndDelete(account.nutriAcc)
        if (!nutritionist) {
            return res.status(404).send({ error: `El nutriologo con id ${account.nutriAcc} no existe` })
        }
    }

    if(user.locker){
        var cabin = await Cabin.findById(user.locker)
        if (!cabin) {
            return res.status(404).send({ error: `El casillero con id ${user.locker} no existe` })
        }
        cabin.assignee = null
        cabin.status = 'Disponible'
        cabin.save()
    }
    for(var i=0; i<user.classes.length; i++){
        var clase = await Class.findByIdAndUpdate(user.classes[i], {$pull: {enrolled: _id}})
        if (!clase) {
            return res.status(404).send({ error: `La clase con id ${user.classes[i]} no existe` })
        }
        clase.save()
    }
    return res.send(user)
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

const getUserOnResetP = function (req, res) {
    const token = req.query.token
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
    updateUser: updateUser,
    fillMedicalRecord: fillMedicalRecord,
    fillMedicalRecordAdmin: fillMedicalRecordAdmin,
    updateUserByAdmin: updateUserByAdmin,
    deleteUser: deleteUser,
    userConfirm: userConfirm,
    resendConfirm: resendConfirm,

    // validateSession: validateSession,
    getAttendance: getAttendance
}


function mailing(nomina, correo, token) {
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
        <li><span style="font-size:16pt">Haz click </span><a href="${FRONT_URL}/confirm?token=${token}" target="_blank" title="Haz clic para confirmar cuenta"><span style="font-size:16pt">aquí</span></a><span style="font-size:16pt"> para completar tu
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
