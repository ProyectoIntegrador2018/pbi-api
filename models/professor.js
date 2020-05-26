const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

if (process.env.NODE_ENV === 'production'){
	var SECRET = process.env.SECRET;
} else{
	const config = require('../config.js')
	var SECRET = config.secret;
}

const professorSchema = new mongoose.Schema({
	name:{
		type:		String,
		required:	true
	},
	surname:{
		type:		String,
		require:	true,
	},
	nomina:{
		type:		String,
		required:	true,
		unique:		true
	},
	campus:{
		type:		String,
	},
	email:{
		type:		String,
		required:	true,
		unique:		true,
		validate(value){
			if (!validator.isEmail(value)){
				throw new Error('Email invalido')
			}
		}
	},
	classes:	[{
		type:		mongoose.Schema.Types.ObjectID,
		ref:		'Class'
	}]
	// ,
	// tokens:	[{
	// 	token:{
	// 		type:		String,
	// 		required:	true
	// 	}
	// }],
	// password:{
	// 	type:		String,
	// 	required:	true,
	// 	minlength:	8,
	// 	trim:	true
	// },
	// confirmToken:{
	// 	type:		String
	// },
	// resetToken:{
	// 	type:		String
	// }
})

// professorSchema.statics.findByCredentials = function (email, password){
// 	return new Promise(function (resolve, reject){
// 		Professor.findOne({email}).then(function (professor){
// 			if (!professor){
// 				return reject('El professor no existe')
// 			}
// 			bcrypt.compare(password, professor.password).then(function (match){
// 				if (match){
// 					return resolve(professor)
// 				} else{
// 					return reject('Contraseña inválida')
// 				}
// 			}).catch(function (error){
// 				return reject('Contraseña inválida')
// 			})
// 		})
// 	})
// }

// professorSchema.methods.generateToken = function (){
// 	const professor = this
// 	const token = jwt.sign({_id:	professor._id.toString()}, SECRET,{expiresIn:	'7 days'})
// 	professor.tokens = professor.tokens.concat({token})
// 	return new Promise(function (resolve, reject){
// 		professor.save().then(function (professor){
// 			return resolve(token)
// 		}).catch(function (error){
// 			return reject(error)
// 		})
// 	})
// }

// professorSchema.methods.generateToken = function () {
// 	const professor = this
// 	const token = jwt.sign({ _id:	professor._id.toString() }, SECRET, { expiresIn:	'7 days' })
// 	professor.tokens = professor.tokens.concat({ token })
// 	return new Promise(function (resolve, reject) {
// 		professor.save().then(function (professor) {
// 			return resolve(token)
// 		}).catch(function (error) {
// 			return reject(error)
// 		})
// 	})
// }

// professorSchema.methods.generateConfirmToken = function () {
// 	const professor = this
// 	const token = jwt.sign({ _id:	professor._id.toString() }, SECRET, { expiresIn:	'2 days' })
// 	professor.confirmToken = "Confirmed"
// 	return new Promise(function (resolve, reject) {
// 		professor.save().then(function (professor) {
// 			return resolve(token)
// 		}).catch(function (error) {
// 			return reject(error)
// 		})
// 	})
// }

// professorSchema.methods.generateResetToken = function () {
// 	const professor = this
// 	const token = jwt.sign({ _id:	professor._id.toString() }, SECRET, { expiresIn:	'2 days' })
// 	professor.resetToken = token
// 	return new Promise(function (resolve, reject) {
// 		professor.save().then(function (professor) {
// 			return resolve(token)
// 		}).catch(function (error) {
// 			return reject(error)
// 		})
// 	})
// }

// professorSchema.statics.confirmUser = function (token) {
// 	return new Promise(function (resolve, reject) {
// 		try {
// 			const decoded = jwt.verify(token, SECRET)
// 			User.findOne({ _id:	decoded._id, 'confirmToken':	token }).then(function (professor) {
// 				if (!professor) {
// 					return reject("Código de confirmación inválido")
// 				}
// 				professor.confirmToken = "Confirmed"
// 				professor.save().then(function (professor) {
// 					return resolve(professor)
// 				}).catch(function (error) {
// 					return reject("No se pudo confirmar la cuenta")
// 				})
// 			}).catch(function (error) {
// 				res.status(401).send({ error:	'No se pudo confirmar la cuenta' })
// 			})
// 		} catch (error) {
// 			reject("Código de confirmación inválido")
// 		}
// 	})

// }

// professorSchema.statics.resetPassword = function (token, newPass) {
// 	return new Promise(function (resolve, reject) {
// 		try {
// 			const decoded = jwt.verify(token, SECRET)
// 			User.findOne({ _id:	decoded._id, 'resetToken':	token })
// 				.then(function (professor) {
// 					professor.resetToken = ""
// 					professor.password = newPass
// 					professor.save()
// 						.then(function (professor) {
// 							return resolve(professor)
// 						}).catch(function (_) {
// 							return reject("No se pudo actualizar la contraseña")
// 						})
// 				}).catch(function (_) {
// 					return reject("No se pudo actualizar la contraseña")
// 				})
// 		} catch (e) {
// 		
// 			return reject("El enlace para reestablecer la contraseña es inválido")
// 		}
// 	})
// }

// professorSchema.statics.getUserOnTokenPass = function (token) {
// 	return new Promise(function (resolve, reject) {
// 		try {
// 			const decoded = jwt.verify(token, SECRET)
// 			User.findOne({ _id:	decoded._id, 'resetToken':	token })
// 				.then(function (professor) {
// 					return resolve({ email:	professor.email, nomina:	professor.nomina })
// 				}).catch(function (_) {
// 					return reject("Enlace para reestablecer la contraseña es inálido")
// 				})
// 		} catch (e) {
// 			return reject("El enlace para reestablecer la contraseña es inválido")
// 		}
// 	})
// }

// professorSchema.statics.validateToken = function (token) {
// 	
// 	return new Promise(function (resolve, reject) {
// 		try {
// 			const decoded = jwt.verify(token, SECRET)
// 			
// 			User.findOne({ _id:	decoded._id, 'tokens.token':	token })
// 				.then(function (professor) {
// 					if (professor) {

// 						if (professor.isAdmin) {
// 							resolve({ admin:	true })
// 						} else {
// 							resolve({ admin:	false })
// 						}
// 					}
// 					else {
// 						reject(false)
// 					}
// 				}).catch(function (_) {
// 					reject(false)
// 				})
// 		} catch (error) {
// 		
// 			reject(false)
// 		}
// 	})
// }

// professorSchema.pre('save', function (next) {
// 	const professor = this
// 	if (professor.isModified('password')) {
// 		bcrypt.hash(professor.password, 8).then(function (hash) {
// 			professor.password = hash
// 			next()
// 		}).catch(function (error) {
// 			return next(error)
// 		})
// 	} else {
// 		next()
// 	}
// })

const Professor = mongoose.model('Professor', professorSchema)
module.exports = Professor
