$(function(){
  var socket = io("http://linuxdemo:8080/index");
  var userid = null;
  var username = null;
  var to = null;

  //用户登入
  $('.login').on('click', function(){
    let username = $('[name="username"]').val();
    if(username != ''){
      $('.mask').hide();
      $('.loginBox').hide();
      init(username);
    }
  });

  function init(user){
    userid = genUid();
    username = user;
    //告诉服务器端有用户登入
    socket.emit('login', {userid: userid, username: username});

    //监听新用户登入
    socket.on('login', function(user){
      console.log(user);
      $('#messages').append(`<span class="join">${user.user.username}加入聊天室</span><br>`);
      adduser(user);
    });
  }

  function adduser(user){
    $('.user').children().remove();
    for(var i=0; i<user.onlineCount; i++){
      var userid = user.onlineUsers[i].userid;
      $('.user').append(`<a href="javascript:;" class="userid" userid="${user.onlineUsers[i].userid}">${user.onlineUsers[i].username}</a>`);
    }
    addClick();
  }

  function addClick(){
    $('.userid').on('click', function(e){
      to = this.getAttribute('userid');
    });
  }

  //唯一id
  function genUid(){
    return new Date().getTime()+""+Math.floor(Math.random()+899+100);
  }

  //用户发送消息
  $('.submit').on('click', function(){
    var message = $('.msg').val();
    var obj = {
      userid: userid,
      username: username,
      message: message,
      to: to
    }
    if(message != ''){
      socket.emit('message', obj);
      $('.msg').val('');
    }
    return false;
  });
  
  socket.on('message', function(msg){
    if(msg.username == username){
      $('#messages').append(`<li class=item>
                                <div class="left">${msg.username}</div>
                                <div class="icon"><img src="/img/triangle-r.png" alt=""/></div>
                                <div class="right">${msg.message}</div>
                            </li>`);
      $('.item:last').css("flex-direction","row-reverse");
      $('.left:last').css("color","#f40");
      $('.right:last').css({"color":"#fff", "background":"#FFD306"});
    }else{
      $('#messages').append(`<li class=item>
                                <div class="left">${msg.username}</div>
                                <div class="icon"><img src="/img/triangle.png" alt=""/></div>
                                <div class="right">${msg.message}</div>
                            </li>`);
    }
    window.scrollTo(0, document.body.scrollHeight);
  });

  //用户退出
  $('.logout').on('click', function(){
    $('.mask').show();
    $('.loginoutBox').show();
  });

  $('.cancel').on('click', function(){
    $('.mask').hide();
    $('.loginoutBox').hide();
  });

  $('.confirm').on('click', function(){
    var obj = {
      uid: userid,
      username: username
    }
    socket.emit('logout', obj);
    $('.mask').hide();
    $('.loginoutBox').hide();
  });

  //监听用户退出
  socket.on('logout', function(obj){
    console.log(obj);
    $('#messages').append(`<span class="join">${obj.logoutUser.username}退出聊天室</span><br>`);
    $('.user').children().remove();
    for(var i=0; i<obj.user.length; i++){
      var userid = obj.user[i].userid;
      $('.user').append(`<a href="javascript:;" class="userid" onclick="toMe(${userid})">${obj.user[i].username}</a>`);
    }
  });

  //选择用户
  $('.more').on('click', function(){
    $('.user').show();
  });
});