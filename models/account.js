const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

if (process.env.NODE_ENV === 'production') {
    var SECRET = process.env.SECRET;
} else {
    const config = require('../config.js')
    var SECRET = config.secret;
}

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    nomina: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Correo inválido')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    userAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    adminAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isProf: {
        type: Boolean,
        default: false
    },
    profAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professor'
    },
    isNutri: {
        type: Boolean,
        default: false
    },
    nutriAcc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nutritionist'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    confirmToken: {
        type: String
    },
    resetToken: {
        type: String
    }
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
})

// accountSchema.virtual('terms', {
// 	ref:			'Term',
// 	localField:		'_id',
// 	foreignField:	'signedAccount	'
// })

accountSchema.methods.toJSON = function () {
    const account = this
    const accountObject = account.toObject()

    delete accountObject.password
    delete accountObject.tokens

    return accountObject
}

accountSchema.statics.findByCredentials = function (email, password) {
    return new Promise(function (resolve, reject) {
        Account.findOne({ email }).then(function (account) {
            if (!account) {
                return reject('La cuenta no existe')
            }
            bcrypt.compare(password, account.password).then(function (match) {
                if (match) {
                    return resolve(account)
                } else {
                    return reject('Contraseña inválida')
                }
            }).catch(function (error) {
                return reject('Contraseña inválida')
            })
        })
    })
}

accountSchema.methods.generateToken = function () {
    const account = this
    const token = jwt.sign({ _id: account._id.toString() }, SECRET, { expiresIn: '7 days' })
    account.tokens = account.tokens.concat({ token })
    return new Promise(function (resolve, reject) {
        account.save().then(function (account) {
            return resolve(token)
        }).catch(function (error) {
            return reject(error)
        })
    })
}

accountSchema.methods.generateConfirmToken = function () {
    const account = this
    const token = jwt.sign({ _id: account._id.toString() }, SECRET, { expiresIn: '2 days' })
    account.confirmToken = "Confirmed"
    return new Promise(function (resolve, reject) {
        account.save().then(function (account) {
            return resolve(token)
        }).catch(function (error) {
            return reject(error)
        })
    })
}

accountSchema.methods.generateResetToken = function () {
    const account = this
    const token = jwt.sign({ _id: account._id.toString() }, SECRET, { expiresIn: '2 days' })
    account.resetToken = token
    return new Promise(function (resolve, reject) {
        account.save().then(function (account) {
            return resolve(token)
        }).catch(function (error) {
            return reject(error)
        })
    })
}

accountSchema.statics.confirmAccount = function (token) {
    return new Promise(function (resolve, reject) {
        try {
            const decoded = jwt.verify(token, SECRET)
            Account.findOne({ _id: decoded._id, 'confirmToken': token }).then(function (account) {
                if (!account) {
                    return reject("Código de confirmación inválido")
                }
                account.confirmToken = "Confirmed"
                account.save().then(function (account) {
                    return resolve(account)
                }).catch(function (error) {
                    return reject("No se pudo confirmar la cuenta")
                })
            }).catch(function (error) {
                res.status(401).send({ error: 'No se pudo confirmar la cuenta' })
            })
        } catch (error) {
            reject("Código de confirmación inválido")
        }
    })

}

accountSchema.statics.resetPassword = function (token, newPass) {
    return new Promise(function (resolve, reject) {
        try {
            const decoded = jwt.verify(token, SECRET)
            Account.findOne({ _id: decoded._id, 'resetToken': token })
                .then(function (account) {
                    account.resetToken = ""
                    account.password = newPass
                    account.save()
                        .then(function (account) {
                            return resolve(account)
                        }).catch(function (_) {
                            return reject("No se pudo actualizar la contraseña")
                        })
                }).catch(function (_) {
                    return reject("No se pudo actualizar la contraseña")
                })
        } catch (e) {
            //console.log(e)
            return reject("El enlace para reestablecer la contraseña es inválido")
        }
    })
}

accountSchema.statics.getAccountOnTokenPass = function (token) {
    return new Promise(function (resolve, reject) {
        try {
            const decoded = jwt.verify(token, SECRET)
            Account.findOne({ _id: decoded._id, 'resetToken': token })
                .then(function (account) {
                    return resolve({ email: account.email, nomina: account.nomina })
                }).catch(function (_) {
                    return reject("Enlace para reestablecer la contraseña es inálido")
                })
        } catch (e) {
            return reject("El enlace para reestablecer la contraseña es inválido")
        }
    })
}

accountSchema.statics.validateToken = function (token) {
    //console.log("Validando")
    return new Promise(function (resolve, reject) {
        try {
            const decoded = jwt.verify(token, SECRET)
            //console.log(decoded._id)
            Account.findOne({ _id: decoded._id, 'tokens.token': token })
                .then(function (account) {
                    if (account) {
                        //console.log(account.isAdmin)
                        if (account.isAdmin) {
                            resolve({ admin: true })
                        } else {
                            resolve({ admin: false })
                        }
                        if (account.isNutri) {
                            resolve({ nutritionist: true })
                        } else {
                            resolve({ nutritionist: false })
                        }
                        if (account.isProf) {
                            resolve({ professor: true })
                        } else {
                            resolve({ professor: false })
                        }
                    }
                    else {
                        reject(false)
                    }
                }).catch(function (_) {
                    reject(false)
                })
        } catch (error) {
            //console.log("erorr!")
            reject(false)
        }
    })
}

accountSchema.pre('save', function (next) {
    const account = this
    if (account.isModified('password')) {
        bcrypt.hash(account.password, 8).then(function (hash) {
            account.password = hash
            next()
        }).catch(function (error) {
            return next(error)
        })
    } else {
        next()
    }
})


const Account = mongoose.model('Account', accountSchema)

module.exports = Account
