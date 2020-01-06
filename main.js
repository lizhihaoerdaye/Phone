const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray;
const Menu = electron.Menu;
const ipcMain = require('electron').ipcMain
const path = require('path')
const url = require('url') 
let win =null;
let tray = null;
function createWindow() {
    var ico = path.join(__dirname, 'img', 'ico.png');
    win = new BrowserWindow({
    width:290,height:555,
    resizable:false, frame: false,transparent: true,
    webPreferences: {
      nodeIntegration: true //完全支持node
    },
    useContentSize:true, //窗口为web页面大小不包含边框
    show:false,
    icon: ico
	})
	win.loadURL(url.format({
    pathname: path.join(__dirname, 'telephone.html'),
    protocol: 'file:',
    slashes: true
	}))
	win.once('ready-to-show',()=>{
    win.isAlwaysOnTop()
    win.show()
    })
    // win.openDevTools();
    const contextMenu = Menu.buildFromTemplate([
        // {
        //     label: '设置',
        //     click: function () {} //打开相应页面
        // },
        // {
        //     label: '帮助',
        //     click: function () {}
        // },
        // {
        //     label: '关于',
        //     click: function () {}
        // },
         { label: '退出软话机',
          click: function() {
            if (win) {
              win.close();
              win = null;
            }
          }
        }
      ])
      tray = new Tray(ico);
      tray.setToolTip('软话机')
      tray.on('click',function(event){
          win.show();
      })
      tray.setContextMenu(contextMenu)

     win.on('closed',()=>{
		    win=null
	  })
}

//点击了最小化
ipcMain.on('zuixiao-hua', (event, arg) => {
    win.minimize()
  })
	
// 接收来电时第一个渲染进程发送过来的消息
 ipcMain.on('laidian-le',(event)=>{
	 const jujiao = win.isFocused()
	 console.log(jujiao)
	if(!jujiao){
	event.returnValue = 'win-no-focused'
	}else{
		event.returnValue = 'win-yes-focused'
	}
	
 })

 ipcMain.on('ziji-zhujincheng',(event)=>{
	 win.show()
 })


//server
function socketserver(){
  var WebSocket = require('ws')
  var WebSocketServer = WebSocket.Server
  var wss = new WebSocketServer({port:8888})
  
  //每一个客户端用数组存起来
  var clients = []
  
  //发送给客户端
function wsSend(type,message,userTypes,client){
  //遍历clients客户端数组
  for(i=0;i<clients.length;i++){
      //将每一个客户端发送消息的模块clients[i].ws拿出来
      var clientSocket = clients[i].ws
      //判断客户端连接状态是否是开启的
      if(clientSocket.readyState === WebSocket.OPEN){
          //通过客户端发送消息
          var sendclient = {
              "type": type,
              "message": message,
              "userTypes":userTypes,
              "client":client
          }
          clientSocket.send(JSON.stringify(sendclient));
      }
  }
}
  wss.on('connection',function(ws){
      clients.push({"ws":ws,})
  
      ws.on('message',function(message){
        var client = JSON.parse(message);
        if(client.type === "lianJieOk"){
          //浏览器连接成功就给拨号盘发送
          wsSend(client.type,client.message);
        }else if(client.type === "nihao"){
          //接收浏览器发送的不间断消息
          wsSend(client.type,client.message);
        }else if(client.type==="qudongpanduan"){
          //检查驱动
          wsSend(client.type,client.message);
        }else if(client.type === "lianjianhezi"){
          //检查盒子和电话卡
          wsSend(client.type,client.message);
        }else if(client.type=== "lianjieyes"){
          //信号值没有问题后
          wsSend(client.type,client.message);
        }
      })

      //客户端关闭时
      ws.on('close', function (e) { 
          console.log('close11111');
          var liuLanQiClose = "duanKai",
              liuLanQiMessage = "duanKai";
          wsSend(liuLanQiClose,liuLanQiMessage);
      });
  })
  }
  //开启单个实例
const gotTheLock = app.requestSingleInstanceLock()
//允许应用中的多例再次同时执行。
if(!gotTheLock){
  app.quit()
}else{
  app.on('second-instance',(event,commandLine,workingDirectory)=>{
    // 当运行第二个实例时,将会聚焦到win这个窗口
    if(win){
      if(win.isMinimized()) win.restore()
      win.focus()
    }
  })
  app.on('ready',createWindow)
  app.on('ready',socketserver)
}


app.on("window-all-closed",()=>{
	if(process.platform !== 'darwin'){
		app.quit()
	}
})

app.on('activate',()=>{
	if(win ===null){
		createWindow()
	}
})