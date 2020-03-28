const Class = require('../models/class')
const User = require('../models/user')
const Term = require('../models/term')

if(process.env.NODE_ENV === 'production'){
    var KEY = process.env.KEY;
    var EMAIL = process.env.EMAIL;
    var HOST = process.env.HOST
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
}else{
	const config = require('../config')
    var KEY = config.key;
    var EMAIL = config.email;
    var HOST = config.host
    var MAILPORT = config.mailport
    var SECURE = config.securehost
}

const createClass = function(req,res){
    const clase = new Class(req.body)
    const idTerm = req.params.id
    Term.findById(idTerm, function(err,term){
        clase.term = term.name + " " + term.year
        clase.save().then(function(){
            term.classes.push(clase._id)    
            //console.log(clase)
            term.save().then(function(){
                return res.send(clase)
            })
        }).catch(function(error){
            return res.status(400).send(error)
        })
    }).catch(function(error){
        return res.status(400).send(error)
    })
}

const createClasses = function(req,res){
    var classes = []
    var idClasses = []
    const data = req.body
    const idTerm = req.params.id
    //console.log(idClasses)
    Term.findById(idTerm, function(err,term){
        data.forEach(function(clase){
            const newClass = new Class(clase)
            newClass.term = term.name + " " + term.year
            classes.push(newClass)
            idClasses.push(newClass["_id"])
        })
        if(err){
            return res.send(err)
        }
        if(!term){
            return res.send("Periodo no encontrado")
        }
        idClasses.forEach(function(idNew){
            term.classes.push(idNew)
        })
        term.save().then(function(){
            Class.insertMany(classes,function(err,clase){
                if (err) {
                    res.send(err)
                }
                res.send(clase)
            })
        })
    }).catch(function(err){
        return res.status(400).send("Periodo dado no encontrado")
    })
}

const updateClass = function(req,res){
    const update= req.body
    const idClass = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'instructor', 'frequency', 'startHour','endHour','classroom','quota']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if( !isValidUpdate ) {
        return res.status(400).send({
            error: 'Invalid update, only allowed to update: ' + allowedUpdates
        })
    }
    Class.findByIdAndUpdate(idClass, update).then(function(clase) {
        if (!clase) {
            return res.status(404).send()
        }
        return res.send(clase)
    }).catch(function(error) {
        res.status(500).send(error)
    })
}

const deleteClass = function(req,res){
    const _id = req.params.id
    const termId = req.query.term
    Class.findByIdAndDelete(_id).then(function(clase){
        if(!clase){
            return res.status(404).send()
        }
        Term.findById(termId).then((term)=>{
            term.classes = term.classes.filter(c => c!=_id)
            term.save().then(()=>{return res.send(clase)})
            .catch(()=>{res.status(500).send({error:"No se pudo borrar la clase"})})
        }).catch(()=>{return res.send({error:"Perido no válido"})})
        
    }).catch(function(error){
        res.status(505).send(error)
    })
}

const getClasses = function(req,res){
    Class.find({}, function(err,classes){
        //console.log(classes)
        return res.send(classes)
    })
}

const getClassByID = function(req,res){
    const _id = req.params.id
    Class.findById(_id).populate('enrolled').exec(function(err,clase){
        //console.log(clase)
        if(!clase){
            return res.status(500).send({error:"La clase no existe"})
        }
        return res.send(clase)
    })
}

const enrollUser = function(req,res){
    const _classID = req.params.id
    var _userID 
    if(req.user){
        _userID = req.user._id
    }else{
        _userID = req.body.id
    }
    User.findById(_userID).then(function(user){
        if(!user){
            return res.status(404).send({ error : `El usuario con id ${_userID} no existe.`})
        }
        Class.findById(_classID).then(function(clase){
            if(!clase){
                return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
            }
            if(clase.enrolled.length >= clase.quota){
                return res.status(707).send({ error : `La clase está a capacidad máxima.`})
            }
            var i
            for(i=0; i < clase.enrolled.length; i++){
                if(clase.enrolled[i].toString() == _userID){
                    return res.status(717).send({ error : `User already enrolled in this class.`})
                }
            }
            Class.findByIdAndUpdate(_classID, {$push : {enrolled: _userID}}).then(function(clase){
                if(!clase){
                    return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
                }
            }).catch(function(error){
                return res.status(505).send({ error: "No se pudo inscribir la clase" })
            })
            User.findByIdAndUpdate(_userID, {$push : {classes : _classID}}).then(function(user){
                if(!user){
                    return res.status(404).send({ error : `El usuario con id ${_userID} no existe.`})
                }
            }).catch(function(error){
                res.status(505).send({ error: error })
            })
            mailing(user.name,user.nomina,user.email,clase)
            return res.send(clase)
        })
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
}

const enrollByPayroll = function(req,res){
    const _classID = req.params.id
    const _payroll = req.body.nomina
    User.findOne({nomina : _payroll}).then(function(user){
        const _userID = user.id
        if(!user){
            return res.status(404).send({ error : `El usuario con nómina ${_payroll} no existe.`})
        }
        Class.findById(_classID).then(function(clase){
            if(!clase){
                return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
            }
            if(clase.enrolled.length >= clase.quota){
                return res.status(707).send({ error : `La clase está a capacidad máxima.`})
            }
            var i
            for(i=0; i < clase.enrolled.length; i++){
                if(clase.enrolled[i].toString() == _userID){
                    return res.status(717).send({ error : `El usuario ya está inscrito en esta clase.`})
                }
            }
            Class.findByIdAndUpdate(_classID, {$push : {enrolled: _userID}}).then(function(clase){
                if(!clase){
                    return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
                }
            }).catch(function(error){
                res.status(505).send({ error: error })
            })
            User.findByIdAndUpdate(_userID, {$push : {classes : _classID}}).then(function(user){
                if(!user){
                    return res.status(404).send({ error : `El usuario con id ${_userID} no existe.`})
                }
            }).catch(function(error){
                res.status(505).send({ error: error })
            })
            mailing(user.name+" "+user.surename,user.nomina,user.email,clase)
            return res.send(clase)
        })
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
}

const disenrollUser = function(req,res){
    const _classID = req.params.id
    var _userID
    if(req.user){
        _userID = req.user._id
    }else{
        _userID = req.body.userID
    }
    User.findByIdAndUpdate(_userID, {$pull : {classes : _classID}}).then(function(user){
        if(!user){
            return res.status(404).send({ error : `El usuario con id ${_userID} no existe.`})
        }
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
    Class.findByIdAndUpdate(_classID, {$pull : {enrolled: _userID}}).then(function(course){
        if(!course){
            return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
        }
        
        return res.send(course)
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
}

const disenrollUserByAdmin = function(req,res){
    const _classID = req.params.id
    var _userID

    _userID = req.body.userID
    
    
    User.findByIdAndUpdate(_userID, {$pull : {classes : _classID}}).then(function(user){
        if(!user){
            return res.status(404).send({ error : `El usuario con id ${_userID} no existe.`})
        }
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
    Class.findByIdAndUpdate(_classID, {$pull : {enrolled: _userID}}).then(function(course){
        if(!course){
            return res.status(404).send({ error : `La clase con id ${_classID} no existe.`})
        }
        return res.send(course)
    }).catch(function(error){
        res.status(505).send({ error: error })
    })
}

//SOLAMENTE REGRESA LAS CLASES DEL PERIODO ACTIVO 
const getUserClasses = function(req,res){
    var classes = req.user.classes
    Class.find({'_id': { $in: classes}}).then((listaClases)=>{
        listaClases.forEach(function(clase){
            Term.findOne({classes:clase._id}).then(function(term){
                if(term.flagCurrent){
                    var listaClasesActivas = []
                    listaClases.forEach(function(clase2){                    
                        if(term.classes.includes(clase2._id)){                           
                            listaClasesActivas.push(clase2)
                        }
                    })
                    return res.send(listaClasesActivas)
                }  
            }).catch(function(error){
                return res.send(error)
            })
        })
        
    }).catch((err)=>{
        res.send(err)
    })
}

module.exports = {
    createClass : createClass,
    updateClass : updateClass,
    getClasses : getClasses,
    getClassByID : getClassByID,
    deleteClass : deleteClass,
    createClasses: createClasses,
    enrollUser : enrollUser,
    enrollByPayroll : enrollByPayroll,
    disenrollUser : disenrollUser,
    disenrollUserByAdmin : disenrollUserByAdmin,
    getUserClasses : getUserClasses
}



function mailing(name,nomina, correo, clase){
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
        subject: "Inscripción de clase",
        html: `</style>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <b style="font-size:12pt; font-style:inherit; font-variant-ligatures:inherit; font-variant-caps:inherit">
                PBI - Confirmación de Inscripción a clase
            </b><br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><br>
            </span></div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
        <i><u>${name}</u></i>, <i><u>${nomina}</u></i> , has inscrito la clase:<br>
        </div>
        <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <span><br>
            </span></div>
            <div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt">
            <ul>
                <li><span style="font-size:16pt">${clase.name}</li>
                <li>Instructor:${clase.instructor}</span></li>
                <li><span style="font-size:15pt">Horario: ${clase.frequency} de ${clase.startHour} a ${clase.endHour}</span></li>
            </ul>
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
</div>
        </div>`
    },(error,info)=> {
        if(error){
            //console.log("Ocurrió un error");
            //console.log(error.message);
            return;
        }

        //console.log("message sent succesfully")
    })
}