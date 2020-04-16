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

const userSchema = new mongoose.Schema({
	name:{
		type:		String,
		required:	true,
	},
	surename:{
		type:		String,
		require:	true,
	},
	nomina:{
		type:		String,
		required:	true,
		unique:		true,
	},
	departamento:{
		type:		String
	},
	rectoria:{
		type:		String
	},
	email:{
		type:		String,
		required:	true,
		unique:		true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email invalido')
			}
		}
	},
	medicalRecord:{
		age:{
			type:		Number,
			default:	0
		},
		// birthDate:{
		// 	type:		Date
		// },
		insuranceCompany:{
			type:		String,
			default:	""
		},
		securityNumber:{
			type:		String,
			default:	""
		},
		hospital:{
			type:		String,
			default:	""
		},
		contactName:{
			type:		String,
			default:	""
		},
		contactPhone:{
			type:		Number,
			default:	0
		},
		contactRelationship:{
			type:		String,
			default:	""
		},
		illnesses:{
			type:		[String]
		},
		flagRecentInjury:{
			type:		Boolean,
			default:	false
		},
		injuryIndication:{
			type:		String,
			default:	""
		},
		flagMedicine:{
			type:		Boolean,
			default:	false
		},
		medicineIndication:{
			type:		String,
			default:	""
		},
		physicalCondition:{
			type:		String,
			default:	""
		}
	},
	filledRecord:{
		type:		Boolean,
		default:	false
	},
	isAdmin:{
		type:		Boolean,
		default:	false
	},
	classes:	[{
		type:		mongoose.Schema.Types.ObjectID,
		ref:		'Class'
	}],
	attendance:	[{
		class:{
			type:		mongoose.Schema.Types.ObjectID,
			ref:		'Class',
			required:	true
		},
		retired: {
			type:		Boolean,
			required:	true
		},
		record:[{
			date:{
				type:		Date,
				required:	true
			},
			assistance:{
				type:		Boolean,
				required:	true
			}
		}]
	}],
	tokens:	[{
		token:{
			type:		String,
			required:	true
		}
	}],
	locker:{
		type:		mongoose.Schema.Types.ObjectID,
		ref:		'Cabin'
	},
	password:{
		type:		String,
		required:	true,
		minlength:	8,
		trim:	true
	},
	confirmToken:{
		type:		String
	},
	resetToken:{
		type:		String
	},
	isAdmin:{
		type:		Boolean
	}
}, {
	toObject:{
		virtuals:	true
	},
	toJson:{
		virtuals:	true
	}
})

userSchema.virtual('terms', {
	ref:			'Term',
	localField:		'_id',
	foreignField:	'signedUser	'
})



userSchema.methods.toJSON = function () {
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens

	return userObject
}


userSchema.statics.findByCredentials = function (email, password) {
	return new Promise(function (resolve, reject) {
		User.findOne({ email }).then(function (user) {
			if (!user) {
				return reject('El usuario no existe')
			}
			bcrypt.compare(password, user.password).then(function (match) {
				if (match) {
					return resolve(user)
				} else {
					return reject('Contraseña inválida')
				}
			}).catch(function (error) {
				return reject('Contraseña inválida')
			})
		})
	})
}

userSchema.methods.generateToken = function () {
	const user = this
	const token = jwt.sign({ _id:	user._id.toString() }, SECRET, { expiresIn:	'7 days' })
	user.tokens = user.tokens.concat({ token })
	return new Promise(function (resolve, reject) {
		user.save().then(function (user) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

userSchema.methods.generateConfirmToken = function () {
	const user = this
	const token = jwt.sign({ _id:	user._id.toString() }, SECRET, { expiresIn:	'2 days' })
	user.confirmToken = "Confirmed"
	return new Promise(function (resolve, reject) {
		user.save().then(function (user) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

userSchema.methods.generateResetToken = function () {
	const user = this
	const token = jwt.sign({ _id:	user._id.toString() }, SECRET, { expiresIn:	'2 days' })
	user.resetToken = token
	return new Promise(function (resolve, reject) {
		user.save().then(function (user) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

userSchema.statics.confirmUser = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			User.findOne({ _id:	decoded._id, 'confirmToken':	token }).then(function (user) {
				if (!user) {
					return reject("Código de confirmación inválido")
				}
				user.confirmToken = "Confirmed"
				user.save().then(function (user) {
					return resolve(user)
				}).catch(function (error) {
					return reject("No se pudo confirmar la cuenta")
				})
			}).catch(function (error) {
				res.status(401).send({ error:	'No se pudo confirmar la cuenta' })
			})
		} catch (error) {
			reject("Código de confirmación inválido")
		}
	})

}

userSchema.statics.resetPassword = function (token, newPass) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			User.findOne({ _id:	decoded._id, 'resetToken':	token })
				.then(function (user) {
					user.resetToken = ""
					user.password = newPass
					user.save()
						.then(function (user) {
							return resolve(user)
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

userSchema.statics.getUserOnTokenPass = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			User.findOne({ _id:	decoded._id, 'resetToken':	token })
				.then(function (user) {
					return resolve({ email:	user.email, nomina:	user.nomina })
				}).catch(function (_) {
					return reject("Enlace para reestablecer la contraseña es inálido")
				})
		} catch (e) {
			return reject("El enlace para reestablecer la contraseña es inválido")
		}
	})
}

userSchema.statics.validateToken = function (token) {
	//console.log("Validando")
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			//console.log(decoded._id)
			User.findOne({ _id:	decoded._id, 'tokens.token':	token })
				.then(function (user) {
					if (user) {

						//console.log(user.isAdmin)
						if (user.isAdmin) {
							resolve({ admin:	true })
						} else {
							resolve({ admin:	false })
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

userSchema.pre('save', function (next) {
	const user = this
	if (user.isModified('password')) {
		bcrypt.hash(user.password, 8).then(function (hash) {
			user.password = hash
			next()
		}).catch(function (error) {
			return next(error)
		})
	} else {
		next()
	}
})


const User = mongoose.model('User', userSchema)

module.exports = User
