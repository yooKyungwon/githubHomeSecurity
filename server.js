var net = require('net');
/*var GCM = require('node-gcm');
var apiKey ='google api key ';
var message = new GCM.Message();
var sender = new GCM.Sender(apiKey);
var regIds=[]; // regIds
message.collapseKey = 'alarm';
message.addData('type','type');
message.addData('msg','message'); //meesage 에 넣을 값 변수 
sender.sendNoRetry(message,regIds,function(err,messageId){
		if(err){
				console.log('gcm Error: ',err);
		}else{
				console.log('Sent with message ID:',messageId);
		}

		});
*/
var server = net.createServer();
var sockets=[];
server.on('connection',function(socket){
		console.log('===New connection===');
		console.log('Connected From: ' + socket.remoteAddress + ':' + socket.remotePort);

		sockets.push(socket);
		socket.setEncoding('utf8');
					socket.on('data',function(data){
						if(data != 'EXIT'){
						console.log('From:',socket.remoteAddress,'Data:',data);
						
						var dataArr =[];
                   		dataArr = data.split(',');
                  		//console.log(dataArr[0]+dataArr[1]+dataArr[2]+dataArr[3]+dataArr[4]+dataArr[5]);

                  		//if(dataArr[0]=='A')
                  		

                  		//else if(dataArr[0]=='M')

						}else{
								close(socket);
						}
						/*data */
						sockets.forEach(function(otherSocket){
									  if(otherSocket!=socket){
										if(data !='EXIT'){

									  	otherSocket.write(data);
										}
										}	
							});
						});				
			});

function close( socket){
console.log('From ',socket.remoteAddress,' Connection Close');
										var index = sockets.indexOf(socket);
										sockets.splice(index,1);
};
function send(alarm){

	sockets.forEach(function(otherSocket){
									  if(otherSocket!=socket){
										if(data !='EXIT'){

									  	otherSocket.write(alarm);
										}
										}	
							});
						}			



server.on('error',function(err){
			var index = sockets.indexOf(socket);
										sockets.splice(index,1);

		console.log('Server Error:',err.message);
		});

server.listen(5000,function(){
			console.log("Listen port: 5000 Tcp Server"); 
		});
