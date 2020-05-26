const mongoose = require('mongoose')

var connectionURL = ""
if(process.env.NODE_ENV === 'production'){
    connectionURL = process.env.DB_CONNECTION_STRING;
}else{
    const config = require('../config.js')
    var connectionURL = config.connectionURL;
}


mongoose.connect( connectionURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
