const mongoose = require('mongoose')
const validator = require('validator')

const recordSchema = new mongoose.Schema({
    matricula:{
        type: String,
        required: true,
        unique: true
    },
    nutritionist:{
        type:       mongoose.Schema.Types.ObjectID,
        ref:        'Nutritionist'
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
    size:{
        type:       String,
    },
    program:{
        type:       String,
    },
    mayorArea:{
        type:       String,
        required:   true
    },
    gender:{
        type:       String,
        required:   true
    },
    patientType:{
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
            },
            drinkQuantity:{
                type: Number,
            },
            drinkFrequency:{
                type: Number
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
                type:       Number,
                default:    0
            },
            vegetable:{
                type:   Number,
                default:    0
            },
            legume:{
                type:   Number,
                default:    0
            },
            cereal:{
                type:   Number,
                default:    0
            },
            sugar:{
                type:   Number,
                default:    0
            },
            fat:{
                type:   Number,
                default:    0
            },
            milkWhole:{
                type:   Number,
                default:    0
            },
            milkSemiSkimmed:{
                type:   Number,
                default:    0
            },
            milkSkimmed:{
                type:   Number,
                default:    0
            },
            meatWhole:{
                type:   Number,
                default:    0
            },
            meatSemiGreasy:{
                type:   Number,
                default:    0
            },
            meatGreasy:{
                type:   Number,
                default:    0
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