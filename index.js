require('dotenv').config();
const express = require('express')
require('./db/mongoose')
var moment = require('moment-timezone');
const {PORT} = require('./config');

const router = require('./routes')


const app = express()

moment.tz.setDefault("America/Monterrey");
app.use(express.json()) // parsea a json
app.use(router)


app.listen(PORT, function () {
    console.log('Server up and running on port ' + PORT)
})
