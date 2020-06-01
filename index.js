const express = require('express')
require('./db/mongoose')
var moment = require('moment-timezone');

const router = require('./routes')


const app = express()
const port = process.env.PORT || 3000

moment.tz.setDefault("America/Monterrey");
app.use(express.json()) // parsea a json
app.use(router)


app.listen(port, function () {
    console.log('Server up and running on port ' + port)
})
