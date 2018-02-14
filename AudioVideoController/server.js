/**
 * Created by moritzmg on 09.07.17.
 */
var express = require('express');
var app = express();
app.use('/', express.static('public'));
app.use('/dist', express.static('dist'));

var server = app.listen(3000, function () {
   var host = server.address().address;
   var port = server.address().port;
});