const mongoose = require('mongoose')
const {CONNECTION_URL} = require('../config');

mongoose.connect(CONNECTION_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
