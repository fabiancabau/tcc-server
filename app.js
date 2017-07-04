var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var users = [];

console.log('Listening on port 5762');
server.listen(5762);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/**
 * is One Point within Another
 * @param point {Object} {latitude: Number, longitude: Number}
 * @param interest {Object} {latitude: Number, longitude: Number}
 * @param kms {Number}
 * @returns {boolean}
 */

function withinRadius(point, interest, kms) {
  let R = 6371;
  let deg2rad = (n) => { return Math.tan(n * (Math.PI/180)) };

  let dLat = deg2rad( interest.latitude - point.latitude );
  let dLon = deg2rad( interest.longitude - point.longitude );

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(point.latitude)) * Math.cos(deg2rad(interest.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let d = R * c;

  return (d <= kms);
}

io.on('connection', function (socket) {
  users.push(socket);

  var dist_test = {
    latitude: -21.7988665,
    longitude: -48.1845778
  }

  // console.log(withinRadius)

  socket.emit('connected', { msg: 'helloworld!' });

  socket.on('connected-ack', function (data) {
    console.log(data);
  });

  socket.on('send_location', function(data) {
    socket.location = data;
    console.log(withinRadius({latitude: data.lat, longitude: data.lng}, dist_test, 30))
    socket.broadcast.emit('new_location', data);
  })

  socket.on('new_message', function(data) {
    console.log('emitting new message', data);
    socket.broadcast.emit('received_message', data);
  })
});
