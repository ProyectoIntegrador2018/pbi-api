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
		type: String,
		required: true
	},
	surname:{
		type: String,
		require: true,
	},
	nomina:{
		type: String,
		required: true,
		unique: true
	},
	email:{
		type: String,
		required: true,
		unique: true,
		validate(value){
			if (!validator.isEmail(value)){
				throw new Error('Email invalido')
			}
		}
	},
	classes: [{
		type: mongoose.Schema.Types.ObjectID,
		ref: 'Class'
	}],
	tokens: [{
		token:{
			type: String,
			required: true
		}
	}],
	password:{
		type: String,
		required: true,
		minlength: 8,
		trim: true
	},
	confirmToken:{
		type: String
	},
	resetToken:{
		type: String
	}
})

professorSchema.statics.findByCredentials = function (email, password){
	return new Promise(function (resolve, reject){
		Professor.findOne({email}).then(function (professor){
			if (!professor){
				return reject('El professor no existe')
			}
			bcrypt.compare(password, professor.password).then(function (match){
				if (match){
					return resolve(professor)
				} else{
					return reject('Contraseña inválida')
				}
			}).catch(function (error){
				return reject('Contraseña inválida')
			})
		})
	})
}

professorSchema.methods.generateToken = function (){
	const professor = this
	const token = jwt.sign({_id: professor._id.toString()}, SECRET,{expiresIn: '7 days'})
	professor.tokens = professor.tokens.concat({token})
	return new Promise(function (resolve, reject){
		professor.save().then(function (professor){
			return resolve(token)
		}).catch(function (error){
			return reject(error)
		})
	})
}


const Locker = mongoose.model('Professor', professorSchema)
module.exports = Professor
