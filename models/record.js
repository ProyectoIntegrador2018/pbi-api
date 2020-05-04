const mongoose = require('mongoose')
const validator = require('validator')

const recordSchema = new mongoose.Schema({
    matricula:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type:       String,
        required:   true
    },
    surname:{
        type:       String,
        required:   true
    },
    birthdate:{
        type:       Date,
        required:   true
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
    mayorArea:{
        type:       String,
        required:   true
    },
    gender:{
        type:       String,
        required:   true
    },
    pacientType:{
        type:       String,
        required:   true
    },
    class:{
        type:       String,

    },
    goal:{//Meta nutricional
        type:       String
    },
    meditions:{
        height:{
            type: Number
        },
        weight:{
            type: Number
        }
    },
    history:{
        familyBackground:{
            type: [String]
        },
        personalBackground:{
            type: [String]
        },
        lifestyle:{
            physicalActivitiy:{
                type:   String
            },
            duration:{//En minutos
                type: Number
            },
            frequency:{
                type: String
            },
            sleepHours:{
                type: Number
            },
            smoker:{
                type: Boolean
            },
            drinker:{
                type: Boolean
            },
            drinkType:{
                type: String
            }
        },
        diet:{
            suplementConsumer:{
                type: Boolean
            },
            sumplementName:{
                type: String
            },
            controlledMethod:{
                type: String
            },
        },
        comments:{
            type: String
        },
        biochemical:{
            cholesterol:{
                type:       String
            },
            triglycerides:{
                type:       String
            },
            glucose:{
                type:       String
            }
        }},
        dayReminder:[{
            fruit:{
                type:   Number
            },
            vegetable:{
                type:   Number
            },
            legume:{
                type:   Number
            },
            cereal:{
                type:   Number
            },
            sugar:{
                type:   Number
            },
            fat:{
                type:   Number
            },
            milkWhole:{
                type:   Number
            },
            milkSemiSkimmed:{
                type:   Number
            },
            milkSkimmed:{
                type:   Number
            },
            meatWhole:{
                type:   Number
            },
            meatSemiGreasy:{
                type:   Number
            },
            meatGreasy:{
                type:   Number
            }
        }]
    ,
    appointments:[{
        type: mongoose.Schema.Types.ObjectId,
        refs: "appointments"
    }]
})

const Record = mongoose.model('Record', recordSchema)
module.exports = Record