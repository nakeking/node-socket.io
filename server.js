var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
const io = require('socket.io')(http, {serverClient:false});

//加载静态文件
app.use(express.static(path.join(__dirname, 'public')));

app.get('/index', function(req, res){
	res.sendFile(__dirname + '/template/index.html');
});

//在线用户
var onlineUsers = [];
//当前在线人数
var onlineCount = 0;

var namespace = io.of('/index');	//使用of('命名空间')声明一个新的空间

namespace.on('connection', function(socket){
	// //获取请求建立socket连接的url
	var url = socket.request.headers.referer;
	console.log(url);
	var splited = url.split('/');
	var roomID = splited[splited.length  - 1];
	console.log(roomID, splited, socket.id);	//获取房间ID
	//监听用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称,然后退出的时候会用到
		socket.id = obj.userid;
		socket.name = obj.username;

		//检查在线列表,如果不在里面就加入
		for(var i=0; i<onlineUsers.length; i++){
			if(onlineUsers[i].userid == obj.userid){
				return ;
			}
		}

		var object = {};
		object.userid = obj.userid;
		object.username = obj.username;
		onlineUsers.push(object);
		//在线人数+1
		onlineCount++;

		//向所有客户端广播用户加入
		socket.broadcast.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username + '加入了聊天室');
	});

	//监听用户退出
	socket.on('logout', function(obj){
		//将退出的用户从在线列表中删除
		for(var i=0; i<onlineCount; i++){
			if(onlineUsers[i].userid == obj.uid){
				//退出用户的信息
				var object = {userid:obj.uid, username:obj.username};

				//删除
				onlineUsers.splice(i,1);
				//在线人数-1
				onlineCount--;

				//向所有客户端广播用户退出
				//socket.leave(socket.id);
				socket.broadcast.emit('logout', {logoutUser:object, user: onlineUsers});
				console.log(object.username + '退出了聊天室');
			}
		}
	});

	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布消息
		if(obj.to == null){
			socket.broadcast.emit('message', obj);
			console.log(obj.username + ':' + obj.message);
		}else{
			console.log(obj.to);
			socket.broadcast.to(obj.to).emit('message', obj);
			console.log(obj.username + ':' + obj.message);
		}
	});
});

http.listen(8080,'0.0.0.0', function(){
	console.log('listening on : 8080');
});