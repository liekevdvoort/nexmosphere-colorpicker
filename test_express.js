//init dependecies
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const express = require('express')
const path = require('path');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.urlencoded({
  extended: true
}))



var rgbdata = ""
var r, g, b;

//init vars
const port = 3000
const name = "Boykes";

var likes = 0;
var rgbout = "";

//setup react and viewengine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



//init serial comms
const serialPort = new SerialPort('COM3', {
  baudRate: 115200
})
//do some serial input stuff here
// Read data that is available but keep the stream in "paused mode"
serialPort.on('readable', function () {
  const parser = serialPort.pipe(new Readline({
    delimiter: '\r\n'
  }))
  console.log('Data:', serialPort.read())
})

function initialLedToWhite() {
  console.log('initialLedToWhite')
  // //update color command
  // serialPort.write('X001B[12123456]');
  //ledstrip on command to white
  serialPort.write('X002B[290005]' + '\r\n');
  //green
  //serialPort.write('X002B[290405]' + '\r\n');
  // ledstrip off
  //serialPort.write('X002B[200005]' + '\r\n');
}

initialLedToWhite();

function updateLedWithHex(hex){
  console.log('updateLedWithHex')
  hexWithoutHashtag = hex.slice(1);
  console.log(`X001B[12${hexWithoutHashtag}]`)
  //update color 2
  //serialPort.write(`X001B[12${hexWithoutHashtag}]` + '\r\n');
  //push to led
  //serialPort.write('X002B[290205]' + '\r\n');

  
  serialPort.write('X002B[290405]' + '\r\n');

}


// Maak de variablen aan zodat er data naar terug kan. 
var hue = 999;
var sat = 999;
var light = 999;
var hexDataGlobal = 'ffffff';

//setup router template /w var to frontend
app.get('/', function (req, res) {
  res.render(path.join(__dirname, '/', 'index.html'), {
    hue: hue,
    sat: sat,
    light: light
  });
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname + '/style.css'))
})

app.post('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
  rgbdata = req.body.rgboutput
  hexdata = req.body.hexoutput
  console.log('incoming rgb data: ', rgbdata)
  console.log('incoming hex data: ', hexdata)
  //res.end()
  hexDataGlobal = req.body.hexoutput;
  console.log(req.body.hexoutput, 'testmet hexoutput in ophaal functie');
  
  updateLedWithHex(req.body.hexoutput);

  hexdata = hexdata.substring(1);

  console.log('split hexdata:', hexdata)

  rgbdata = rgbdata.substring(
  rgbdata.lastIndexOf("(") + 1,
  rgbdata.lastIndexOf(")"),
);

rgbdatarray = rgbdata.split(',')
r = rgbdatarray[0];
g = rgbdatarray[1];
b = rgbdatarray[2];

console.log('r 255 range: ', r);
console.log('g 255 range: ', g);
console.log('b 255 range: ', b);


r = (r/255) * 100;
r= Math.round(r);

g = (g/255) * 100;
g = Math.round(g);

b = (b/255) * 100;
b = Math.round(b);
b = b.toString(16);

console.log('r after recalc: ', r);
console.log('g after recalc: ', g);
console.log('b after recalc: ', b);



hexdata = "X002B[10"+ hexdata +  "]"
setData = "X002B[299005]"

console.log(hexdata);



serialPort.on('writable', function () {
  console.log(comPort + ' is open');
  // serialPort.write(hexdata + '\r\n');
  // serialPort.write(setData + '\r\n');
});

serialPort.write('open', function() {
  // serialPort.write(hexdata, function(err) {
  //  if (err) {
  //   return console.log('Error on write: ', err.message);
  //  }
  //  console.log('hexdata set');
  // });
});

})





//io.on('connection', socket => {
//  console.log('a user connected!')
//  socket.on('likes:updated', () => {
//    socket.broadcast.emit('likes:update', likes)
//  })
//  socket.on('disconnect', () => {
//    console.log('user disconnected!')
//  })
//})






// Switches the port into "flowing mode"
var x = serialPort.on('data', function (data) {

  var msg = data.toString()
  console.log('msg: ', msg);

  var cleanmsg = msg.substring(
    msg.lastIndexOf("[") + 1,
    msg.lastIndexOf("]"),
  );
  console.log("Clean msg", cleanmsg)
  console.log("Hue Sander: ", hue);



  if (cleanmsg == "Cv=XXX,XXX,XXX") {
    console.log("Not a clean message")
  } else {
    //console.log('Received cleanmsg: ', cleanmsg);

    cleanmsg = cleanmsg.substring(3);
    cleanmsg = cleanmsg.split(',');

    //console.log('cleanmsg 1: ', parseInt(cleanmsg[0]));
    //console.log('cleanmsg 2: ', parseInt(cleanmsg[1]));
    //console.log('cleanmsg 3: ', parseInt(cleanmsg[2]));

    msg = "";
    // de "Var" weggehaald 
    hue_1 = parseInt(cleanmsg[0]);
    sat_1 = parseInt(cleanmsg[1]);
    light_1 = parseInt(cleanmsg[2])

    if (hue_1 > 0 && sat_1 > 0 && light_1 > 0) {
      hue = hue_1;
      sat = sat_1;
      light = light_1;
      console.log('-------------------------------------------------------------------------------------------------------');
      console.log('Hue: ', hue);
      console.log('Saturation: ', sat);
      console.log('Lightness: ', light);
      console.log('-------------------------------------------------------------------------------------------------------');
    }
  }
})

// Pipe the data into another stream (like a parser or standard out)
const lineStream = serialPort.pipe(new Readline({
  delimiter: '\r\n'
}))










//run server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//http.listen(3000, () => console.log('the app is running on localhost:3000'))




//do some serial output stuff here