const SerialPort = require("serialport");
const express = require('express');
const http = require('http');
const ejs = require('ejs');
const path = require('path');

const app = express();
const server = http.createServer(app)
const serialPort = new SerialPort("COM7", {
    baudRate: 115200
});

//init const
const port = 3000;
var hue = 999;
var sat = 999;
var light = 999;

//test colours
var white = 'X002B[290005]\r\n'
var green = 'X002B[290405]\r\n'

//init app
app.use(express.urlencoded({
    extended: true
}));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

//run server
app.listen(port, function(){
    console.log(`Example app listening at http://localhost:${port}`);
})

//router template
app.get('/', function(request, response){
    response.render(path.join(__dirname, '/', 'index.html'), {
        hue: hue,
        sat: sat,
        light: light
    });
});

app.get('/style.css', function(request, response){
    response.sendFile(path.join(__dirname, '/', 'style.css'));
})

app.post('/', function(request, response){
    response.sendFile(path.join(__dirname, '/', 'success.html'));
    rgb_data = request.body.rgboutput;
    hex_data = request.body.hexoutput;
    hex_data_without_hashtag = hex_data.slice(1);

    setTimeout(write_to_serial, 300, `X002B[10${hex_data_without_hashtag}]\r\n`);
    setTimeout(write_to_serial, 600, `X002B[299005]\r\n`);
});

function write_to_serial(command){
    serialPort.write(command);
}

serialPort.on("open", function(){
    console.log("open");
})

serialPort.on('data', function(data){
    var msg = data.toString()
    var cleanmsg = msg.substring(msg.lastIndexOf("[") + 1, msg.lastIndexOf("]"),);
    console.log(cleanmsg);

    if (cleanmsg == "Cv=XXX,XXX,XXX") {
        console.log("Not a clean message")
    }else {
        cleanmsg = cleanmsg.substring(3).split(',');
        hue_1 = parseInt(cleanmsg[0]);
        sat_1 = parseInt(cleanmsg[1]);
        light_1 = parseInt(cleanmsg[2]);
        if (hue_1 > 0 && sat_1 > 0 && light_1 > 0) {
            hue = hue_1;
            sat = sat_1;
            light = light_1;
        }
    }
})





