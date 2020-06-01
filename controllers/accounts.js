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
    if (req.account.isAdmin) {
        var admin = await Admin.findByIdAndUpdate(req.account.adminAcc, req.body)
        admin.save()
    }
    if (req.account.isNutri) {
        var nutritionist = await Nutritionist.findByIdAndUpdate(req.account.nutriAcc, req.body)
        nutritionist.save()
    }
    if (req.account.isProf) {
        var professor = await Professor.findByIdAndUpdate(req.account.profAcc, req.body)
        professor.save()
    }

    const _hash = await bcrypt.hash(req.body.password, 8)
    if (_hash) {
        account.password = _hash
    }

    account.save().then(function () {
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

const requestResetPassword = function (req, res) {
    const email = req.body.email
    Account.findOne({ "email": email }).then(function (acc) {
        acc.generateResetToken().then(function (token) {
            mailResetPassword(email, token)
            return res.send("OK")
        }).catch(function (error) {
            return res.status(400).send({ error: "No se pudo enviar el correo de cambio de contraseña" })
        })
    }).catch(function (error) {
        return res.status(400).send({ error: "No hay una cuanta registrada con el e-mail introducido" })
    })
}

const resetPassword = function (req, res) {
    const token = req.body.token
    const password = req.body.password
    if (token) {
        Account.resetPassword(token, password).then(function (_) {
            return res.send("OK")
        }).catch(function (error) {
            return res.status(400).send({ error: error })
        })
    } else {
        return res.status(400).send({ error: "Enlace inválido" })
    }
}

const getUserOnResetP = function (req, res) {
    const token = req.query.token
    if (token) {
        Account.getAccountOnTokenPass(token).then(function (acc) {
            return res.send(acc)
        }).catch(function (error) {
            return res.status(400).send({ error: error })
        })
    } else {
        return res.status(400).send({ error: "Enlace inválido" })
    }
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
    validateSession: validateSession,
    requestResetPassword: requestResetPassword,
    resetPassword: resetPassword,
    getUserOnResetP: getUserOnResetP
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
