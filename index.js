const express = require('express');
const cors = require('cors');
require('dotenv').config({path:'/home/ubuntu/.env'});

const events = require('./routes/events');
const users = require('./routes/users');
const bookings = require('./routes/bookings');
const fileupload =  require('./routes/fileupload');
const photoUpload =  require('./routes/photoUpload');
const app = express();
const bodyparser = require("body-parser");
const port = process.env.PORT || 3001;


app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
app.use('/events', events);
app.use('/users', users);
app.use('/booking', bookings);
app.use('/api', fileupload);
app.use('/photoUpload', photoUpload);

app.get('/', function (req, res) {
    res.send('EventSync!!!')
})


app.listen(port, function () {
    console.log('listening on port', port);
});

module.exports = app;
