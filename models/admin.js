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

const adminSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	surename: {
		type: String,
		require: true,
	},
	nomina: {
		type: String,
		required: true,
		unique: true,
	},
	departamento: {
		type: String
	},
	rectoria: {
		type: String
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email invalido')
			}
		}
	},
	medicalRecord: {
		age: {
			type: Number,
			default: 0
		},
		//  birthDate: {
		//  	type:	Date
		//  },
		insuranceCompany: {
			type: String,
			default: ""
		},
		securityNumber: {
			type: String,
			default: ""
		},
		hospital: {
			type: String,
			default: ""
		},
		contactName: {
			type: String,
			default: ""
		},
		contactPhone: {
			type: Number,
			default: 0
		},
		contactRelationship: {
			type: String,
			default: ""
		},
		illnesses: {
			type: [String]
		},
		flagRecentInjury: {
			type: Boolean,
			default: false
		},
		injuryIndication: {
			type: String,
			default: ""
		},
		flagMedicine: {
			type: Boolean,
			default: false
		},
		medicineIndication: {
			type: String,
			default: ""
		},
		physicalCondition: {
			type: String,
			default: ""
		}
	},
	filledRecord: {
		type: Boolean,
		default: false
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	classes: [{
		type: mongoose.Schema.Types.ObjectID,
		ref: 'Class'
	}],
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	password: {
		type: String,
		required: true,
		minlength: 8,
		trim: true
	},
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

adminSchema.virtual('terms', {
	ref: 'Term',
	localField: '_id',
	foreignField: 'signedAdmin	'
})



adminSchema.methods.toJSON = function () {
	const admin = this
	const adminObject = admin.toObject()

	delete adminObject.password
	delete adminObject.tokens

	return adminObject
}


adminSchema.statics.findByCredentials = function (email, password) {
	return new Promise(function (resolve, reject) {
		Admin.findOne({ email }).then(function (admin) {
			if (!admin) {
				return reject('El usuario no existe')
			}
			bcrypt.compare(password, admin.password).then(function (match) {
				if (match) {
					return resolve(admin)
				} else {
					return reject('Contraseña inválida')
				}
			}).catch(function (error) {
				return reject('Contraseña inválida')
			})
		})
	})
}

adminSchema.methods.generateToken = function () {
	const admin = this
	const token = jwt.sign({ _id: admin._id.toString() }, SECRET, { expiresIn: '7 days' })
	admin.tokens = admin.tokens.concat({ token })
	return new Promise(function (resolve, reject) {
		admin.save().then(function (admin) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

adminSchema.methods.generateConfirmToken = function () {
	const admin = this
	const token = jwt.sign({ _id: admin._id.toString() }, SECRET, { expiresIn: '2 days' })
	admin.confirmToken = "Confirmed"
	return new Promise(function (resolve, reject) {
		admin.save().then(function (admin) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

adminSchema.methods.generateResetToken = function () {
	const admin = this
	const token = jwt.sign({ _id: admin._id.toString() }, SECRET, { expiresIn: '2 days' })
	admin.resetToken = token
	return new Promise(function (resolve, reject) {
		admin.save().then(function (admin) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

adminSchema.statics.confirmAdmin = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Admin.findOne({ _id: decoded._id, 'confirmToken': token }).then(function (admin) {
				if (!admin) {
					return reject("Código de confirmación inválido")
				}
				admin.confirmToken = "Confirmed"
				admin.save().then(function (admin) {
					return resolve(admin)
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

adminSchema.statics.resetPassword = function (token, newPass) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Admin.findOne({ _id: decoded._id, 'resetToken': token })
				.then(function (admin) {
					admin.resetToken = ""
					admin.password = newPass
					admin.save()
						.then(function (admin) {
							return resolve(admin)
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

adminSchema.statics.getAdminOnTokenPass = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Admin.findOne({ _id: decoded._id, 'resetToken': token })
				.then(function (admin) {
					return resolve({ email: admin.email, nomina: admin.nomina })
				}).catch(function (_) {
					return reject("Enlace para reestablecer la contraseña es inálido")
				})
		} catch (e) {
			return reject("El enlace para reestablecer la contraseña es inválido")
		}
	})
}

adminSchema.statics.validateToken = function (token) {
	//console.log("Validando")
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			//console.log(decoded._id)
			Admin.findOne({ _id: decoded._id, 'tokens.token': token })
				.then(function (admin) {
					if (admin) {

						//console.log(admin.isAdmin)
						if (admin.isAdmin) {
							resolve({ admin: true })
						} else {
							resolve({ admin: false })
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

adminSchema.pre('save', function (next) {
	const admin = this
	if (admin.isModified('password')) {
		bcrypt.hash(admin.password, 8).then(function (hash) {
			admin.password = hash
			next()
		}).catch(function (error) {
			return next(error)
		})
	} else {
		next()
	}
})


const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
