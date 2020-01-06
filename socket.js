//  //建立连接
//  var ws = new WebSocket("ws://localhost:8181");

//  ws.onerror = function() {
//      console.log("error");
//   };
//  ws.onopen = function (e) {
//      console.log('与服务连接');
//  }
//  //收到消息处理 获取到的用户信息
//  ws.onmessage = function (e) {
//   var data = JSON.parse(e.data)
//   if(data.message ==undefined) return;
//   if(data.type==='hezhidenglu'){
//       console.log(data.message+":"+data.userName)
//       $('.anzhuang').hide();
//       if(websocket.readyState === 3){ //CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
//           var shuzu = {type:"panduan",message:"用户请安装驱动"}
//           ws.send(JSON.stringify(shuzu))
//       }
//   }
//  }


//  ws.onclose = function (e) {
//      console.log("连接关闭了");
//  }
 
//  //发送不断点
//  function ping(){
//      var ping = {"type":"ping",message:"已和软话机连接"};
//      ws.send(JSON.stringify(ping));
//  }

//  window.setInterval('ping()',5000)