var http = require('http');
var express = require('express');
var socketio = require('socket.io');
// var serialport = require('serialport');
// var SerialPort = serialport.SerialPort;
//var serialPort = new SerialPort('COM4', {
// var serialPort = new SerialPort('/dev/tty.usbmodem1421', {
// 		baudrate:9600,
// 		parser: serialport.parsers.readline("\n")
// });


var app = express();
var server = http.createServer(app);
var io = socketio(server);
var socketMe=io;
var mode = 'NOR'; //NOR, SLP, OUT
var oldPacket = {};
var neoPacket = {};
var diffPacket = {};

app.use(express.static(__dirname + '/www'));
app.get('/', function(req, res){
//	res.sendFile(__dirname + '/www/index.html');
	res.sendFile(__dirname + '/www/old.html');
});
/*버튼이 눌렸을 경우 아두이노에게 socket 메세지 전송 */
/*안드로이드에서는 해당 URL로 json 형식으로 데이터를 보내서 파싱 후 현관열림을 설정*/


app.get('/command.do', function(req, res){
	var key = req.param('key');
	var value = req.param('value');
	console.log('cmd:' + key +"," + value);
	var resmsg = {status : '0', msg: ''};
	if(key == 'MODE'){
		if(value == "normal"){
			mode = "NOR";
		}else if(value == "sleep" || value == "out"){
			mode = "SLP";
			if(neoPacket.DR == 0){ //DR:0 --> alarm
				resmsg.status = 1;
				resmsg.msg += '현관열림 ';
				mode = "NOR";
			}
			if(neoPacket.WN ==1 ){ //WN :1 -- >alarm
				resmsg.status = 1;
				resmsg.msg += '창문열림 ';
				mode = "NOR";
			}
			if(value == "out"){
				mode = "OUT";
				if(neoPacket.MT ==1){ //MT :1 --> alarm
					resmsg.status = 1;
					resmsg.msg += '실내움직임 ';
					mode = "NOR";
				}
			}
		}
		res.send(resmsg);
		return;
	}

	var cmd = "";
	if(key == 'L1'){
		cmd = eval(value)  ? 'L1.' : 'L0.';
	}else if(key == 'L2'){
		cmd = eval(value) ? 'L3.' : 'L2.';
	}else if(key == 'L3'){
		cmd = eval(value) ? 'L5.' : 'L4.';
	}else if(key == 'AC'){
		cmd = eval(value)? 'A1.' : 'A0.';
	}else if(key == 'HT'){
		cmd = eval(value) ? 'H1.' : 'H0.';
	}

		// socket.broadcast.emit(cmd, function(err, result){
		// 	if(err){
		// 		console.log('12');
		// 		console.log("socketMe",socket);
		// 		console.log(err);
		// 		resmsg.status= 1;
		// 		resmsg.msg = err.description;
		// 		res.send(resmsg);
		// 	}else{
		// 		res.send(resmsg)
		// 	}
		// });


});
/*아두이노로부터 받은 값을 브로드 캐스팅*/
// socketMe.on('recvEvent', function(data){
// 	console.log('RCV:' + data);

// 	try{
// 		neoPacket = JSON.parse('{' + data + "}");
// 		diffPacket = {};
// 		for(var k in neoPacket){
// 			if(k !='IM' && k != 'LX' && neoPacket[k] != oldPacket[k]){
// 				diffPacket[k] = neoPacket[k];
// 			}
// 		}
// 		oldPacket = neoPacket;
// 		sendPacket();
// 	}catch(e){
// 		console.error(e);
// 	}

// });
io.on('connect', function(socket){
	console.log('socket connect..');

	socketMe=socket; //자신의 socket
});
/*gcm 메세지 보내는 함수로 바꾸기 */
function sendPacket(){
	if(io.sockets.sockets.length == 0) return;
	var count = 0;
	for (var k in diffPacket) {
	    if (diffPacket.hasOwnProperty(k)) {
	       ++count;
	    }
	}
	if(count){
		socketMe.broadcast.emit('monitor', diffPacket);
		if(mode !== "NOR"){
			if(diffPacket.DR == 0){ //DR:0 --> alarm
				socketMe.broadcast.emit('alarm', {msg :'현관에 침입이 감지 되었습니다.'});
			}
			if(diffPacket.WN ==1 ){ //WN :1 -- >alarm
			socketMe.broadcast.emit('alarm', {msg :'창문에 침입이 감지 되었습니다.'});
			}

			if(mode == "OUT"){
				if(diffPacket.MT ==1){ //MT :1 --> alarm
					socketMe.broadcast.emit('alarm', {msg :'실내에 움직임이 감지 되었습니다.'});
				}
			}
		}
	}
}
/**/
server.listen(8000, function(){
	console.log('server running...');
});
