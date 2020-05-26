const Nutritionist = require('../models/nutritionist')
const User = require('../models/user')

if (process.env.NODE_ENV === 'production') {
    var KEY = process.env.KEY;
    var EMAIL = process.env.EMAIL;
    var frontURL = process.env.FRONTURL
    var HOST = process.env.HOST
    var MAILPORT = process.env.MAILPORT
    var SECURE = process.env.SECUREHOST
    var SECRET = process.env.SECRET
} else {
    const config = require('../config')
    var KEY = config.key;
    var EMAIL = config.email;
    var frontURL = config.frontURL
    var HOST = config.host
    var MAILPORT = config.mailport
    var SECURE = config.securehost
    var SECRET = config.secret
}

const logout = async function (req, res) {
    var _id
    if (req.user) {
        _id = req.user._id
    } else if (req.nutritionist) {
        _id = req.nutritionist._id
    } else {
        _id = req.body.id
    }

    var user = await User.findById(_id).catch(function (error) {
        res.status(505).send({ error: error })
    })

    var nutritionist = await Nutritionist.findById(_id).catch(function (error) {
        res.status(505).send({ error: error })
    })

    if (!user && !nutritionist) {
        return res.status(404).send({ error: "Autenticar por favor" })
    }

    if (user) {
        user.tokens.tokens.pull({token: token.token})
        user.save().then(function () {
            return res.send(true)
        }).catch(function (error) {
            return res.status(500).send({ error: error })
        })
    }

    if (nutritionist) {
        nutritionist.tokens.pull({token: token.token})
        nutritionist.save().then(function () {
            return res.send(true)
        }).catch(function (error) {
            return res.status(500).send({ error: error })
        })
    }

}

module.exports = {
    logout: logout
}