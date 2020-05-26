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

const nutritionistSchema = new mongoose.Schema({
	name:{
		type:		String,
		required:	true,
	},
	surname:{
		type:		String,
		required:	true,
	},
	nomina:{
		type:		String,
		required:	true,
		unique:		true,
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
	records:	[{
		type:		mongoose.Schema.Types.ObjectID,
		ref:		'Record'
	}],
	appointments: [{
		type:		mongoose.Schema.Types.ObjectID,
		ref:		'Appointment'
	}],
	tokens:	[{
		token:{
			type:		String,
			required:	true
		}
	}],
	password:{
		type:		String,
		required:	true,
		minlength:	8,
		trim:	true
	},
	resetToken:{
		type:		String
	}
}, {
	toObject:{
		virtuals:	true
	},
	toJson:{
		virtuals:	true
	}
})

nutritionistSchema.virtual('terms', {
	ref:			'Term',
	localField:		'_id',
	foreignField:	'signedUser	'
})



nutritionistSchema.methods.toJSON = function () {
	const nutritionist = this
	const nutritionistObject = nutritionist.toObject()

	delete nutritionistObject.password
	delete nutritionistObject.tokens

	return nutritionistObject
}


nutritionistSchema.statics.findByCredentials = function (email, password) {
	return new Promise(function (resolve, reject) {
		Nutritionist.findOne({email: email}).then(function (nutritionist) {
			if (!nutritionist) {
				return reject('El usuario no existe')
			}
			bcrypt.compare(password, nutritionist.password).then(function (match) {
				if (match) {
					return resolve(nutritionist)
				} else {
					return reject('Contraseña inválida')
				}
			}).catch(function (error) {
				return reject('Contraseña inválida')
			})
		})
	})
}

nutritionistSchema.methods.generateToken = function () {
	const nutritionist = this
	const token = jwt.sign({ _id:	nutritionist._id.toString() }, SECRET, { expiresIn:	'7 days' })
	nutritionist.tokens = nutritionist.tokens.concat({ token })
	return new Promise(function (resolve, reject) {
		nutritionist.save().then(function (nutritionist) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

nutritionistSchema.methods.generateConfirmToken = function () {
	const nutritionist = this
	const token = jwt.sign({ _id:	nutritionist._id.toString() }, SECRET, { expiresIn:	'2 days' })
	nutritionist.confirmToken = "Confirmed"
	return new Promise(function (resolve, reject) {
		nutritionist.save().then(function (nutritionist) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

nutritionistSchema.methods.generateResetToken = function () {
	const nutritionist = this
	const token = jwt.sign({ _id:	nutritionist._id.toString() }, SECRET, { expiresIn:	'2 days' })
	nutritionist.resetToken = token
	return new Promise(function (resolve, reject) {
		nutritionist.save().then(function (nutritionist) {
			return resolve(token)
		}).catch(function (error) {
			return reject(error)
		})
	})
}

nutritionistSchema.statics.confirmNutritionist = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Nutritionist.findOne({ _id:	decoded._id, 'confirmToken':	token }).then(function (nutritionist) {
				if (!nutritionist) {
					return reject("Código de confirmación inválido")
				}
				nutritionist.confirmToken = "Confirmed"
				nutritionist.save().then(function (nutritionist) {
					return resolve(nutritionist)
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

nutritionistSchema.statics.resetPassword = function (token, newPass) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Nutritionist.findOne({ _id:	decoded._id, 'resetToken':	token })
				.then(function (nutritionist) {
					nutritionist.resetToken = ""
					nutritionist.password = newPass
					nutritionist.save()
						.then(function (nutritionist) {
							return resolve(nutritionist)
						}).catch(function (_) {
							return reject("No se pudo actualizar la contraseña")
						})
				}).catch(function (_) {
					return reject("No se pudo actualizar la contraseña")
				})
		} catch (e) {
			return reject("El enlace para reestablecer la contraseña es inválido")
		}
	})
}

nutritionistSchema.statics.getNutritionistOnTokenPass = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Nutritionist.findOne({ _id:	decoded._id, 'resetToken':	token })
				.then(function (nutritionist) {
					return resolve({ email:	nutritionist.email, nomina:	nutritionist.nomina })
				}).catch(function (_) {
					return reject("Enlace para reestablecer la contraseña es inálido")
				})
		} catch (e) {
			return reject("El enlace para reestablecer la contraseña es inválido")
		}
	})
}

nutritionistSchema.statics.validateToken = function (token) {
	return new Promise(function (resolve, reject) {
		try {
			const decoded = jwt.verify(token, SECRET)
			Nutritionist.findOne({ _id:	decoded._id, 'tokens.token':	token })
				.then(function (nutritionist) {
					if (nutritionist) {
						if (nutritionist.isAdmin) {
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
			reject(false)
		}
	})
}

nutritionistSchema.pre('save', function (next) {
	const nutritionist = this
	if (nutritionist.isModified('password')) {
		bcrypt.hash(nutritionist.password, 8).then(function (hash) {
			nutritionist.password = hash
			next()
		}).catch(function (error) {
			return next(error)
		})
	} else {
		next()
	}
})


const Nutritionist = mongoose.model('Nutritionist', nutritionistSchema)

module.exports = Nutritionist
