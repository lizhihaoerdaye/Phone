var typeNumber = 4;
var errorCorrectionLevel = 'L';
/*
var aLink = document.createElement('a');
    aLink.download = "qrscan.742961365471334400.js";
    aLink.href = "https://scan-code-guest.oss-cn-shenzhen.aliyuncs.com/script/qrscan.742961365471334400.js";
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
  */
  //与电话盒子的websocket

  let callState = CMD_REPORT_CALL_HANGUP;

  let ano = null;

  let dn = null;

  let recordFile = null;

  let phone = null;

  let isOffLine = false;

  var sipwebsocket = null

  var websocket = null

  var sipdingshi = null

  var hezidingshi = null

   //建立与本地服务连接
   function createWebsocket() {
    try {
        if ('WebSocket' in window) {
            ws = new WebSocket("ws://localhost:8888")
            init()
        } else {
            alert("不支持websocket")
        }
    } catch (e) {
        console.log("catch")
        reconnect();
    }
}
function init() {
  ws.onerror = function() {
    console.log("error");
    reconnect();
 };
  ws.onopen = function (e) {
  console.log('与服务连接');
 };
  //收到消息处理 
  ws.onmessage = function (e) {
    var data = JSON.parse(e.data)
    if(data.message ==undefined) return;
    if(data.type === "lianJieOk"){
      hezidingshi = true;
      qudongCreateWebsocket()
      $('.anzhuang').hide();
      $('.shiyi').removeClass('notclickn');
      
    }
    if(data.type === "duanKai"){
      hezidingshi = false;
      $('.qudong').hide();
      $('.anzhuang').show();
      $('.shiyi').addClass('notclickn');
    }
    
   };
   ws.onclose = function (e) {
    console.log("连接关闭了");
    reconnect();
 };
};

//重连方法
var rebinding
var lockReconnect = false
function reconnect() {
    if (lockReconnect) {
        return;
    }
    lockReconnect = true;
    if (rebinding) {
        clearTimeout(rebinding)
    }
    rebinding = setTimeout(function () {
        createWebsocket();
        lockReconnect = false
    }, 4000)
};
createWebsocket();


//与驱动的连接
  function qudongCreateWebsocket() {
  try {
    //判断当前浏览器是否支持WebSocket
      if ('WebSocket' in window) {
        websocket = new WebSocket("ws://localhost:13001/onebox/ws");
        qudonginit()
      } else {
        alert('Not support websocket')  
      }
  } catch (e) {
      console.log("catch")
      againReconnect();
  }
};
  function qudonginit(){
    //连接发生错误的回调方法
    websocket.onerror = function() {
      console.log("error")
      setMessageInnerHTML("error");
      var shuzu = {type:"panduan",message:"用户请检查驱动"}
      ws.send(JSON.stringify(shuzu))
      // 先判断浏览器是否打开
      if(hezidingshi){
        $('.qudong').text('请检查驱动').show()
      }
      againReconnect()  
    };
    //连接成功建立的回调方法
    websocket.onopen = function(event) {
      setMessageInnerHTML("open");
      getFileList();
      // $('.qudong').hide();  
      heartCheck.start();
    };
  
    //接收到消息的回调方法
    websocket.onmessage = function(event) {
      const message = JSON.parse(event.data);
      if (message.type === SERVER_SEND_CALL_STATE) {
      //通话状态
        handleCallState(message);
              // console.log(message.called);
      }else if (message.type === SERVER_SEND_CALL_RECORD) {
      //通话记录
        handleCallRecord(message);
      } else if (message.type === CLIENT_SET_CALL_HANGUP) {
      //结束通话状态
        callState = CMD_REPORT_CALL_HANGUP;
      } else if (message.type === CLIENT_GET_SIM_SINGAL) {
      //获取信号值
        displaySignals(message.signals);
        heartCheck.start();
      } else if (message.type === CLIENT_GET_FILE_LIST) {
      //录音文件
        checkDeleteFile(message.files);
      } else {
        // setMessageInnerHTML(event.data);
      };
  
    };
  
    //连接关闭的回调方法
    websocket.onclose = function() {
      console.log('close')
      // 先判断浏览器是否打开
      if(hezidingshi){
        $('.qudong').text('请检查驱动').show()
      }
      var qudongduankai = {type:"qudongpanduan",message:"请检查驱动"}
      ws.send(JSON.stringify(qudongduankai))
      setMessageInnerHTML("close");
      againReconnect();
    };
  
    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function() {
      closeWebSocket();
    };
  };
  //关闭连接
  function closeWebSocket() {
    websocket.close();
  };
  //重连方法
  var qudongRebinding
  var qudongReconnect = false
  function againReconnect() {
      if (qudongReconnect ) {
          return;
      }
      qudongReconnect = true;
      if (qudongRebinding) {
          clearTimeout(qudongRebinding)
      }
      
      qudongRebinding = setTimeout(function () {
          qudongCreateWebsocket();
          qudongReconnect = false;
      }, 4000);
  };

  //网络不好的情况
  var heartCheck = {
      timeout: 3000, //每隔三秒发送心跳
      severTimeout: 5000,  //服务端超时时间
      timeoutObj: null,
      serverTimeoutObj: null,
      start: function () {
          var _this = this;
          if (this.timeoutObj) {
              clearTimeout(this.timeoutObj);
          }
          if (this.serverTimeoutObj) {
              clearTimeout(this.serverTimeoutObj);
          }
          this.timeoutObj = setTimeout(function () {
              //这里发送一个心跳，后端收到后，返回一个心跳消息，
              //onmessage拿到返回的心跳就说明连接正常
              // 心跳发给服务的消息
              getSignals();
              //计算答复的超时时间 5秒钟没有收到心跳返回的消息后就关闭连接;重新连接
              _this.serverTimeoutObj = setTimeout(function () {
                 
                  websocket.close();
              }, _this.severTimeout);
          }, this.timeout)
      }
  };



// function sipSocket(){
//   //判断当前浏览器是否支持WebSocket
//   if ('WebSocket' in window) {
   
//     sipwebsocket = new WebSocket("ws://localhost:3000");

//   } else {
//     alert('Not support websocket')
//   }

//   //连接发生错误的回调方法
//   sipwebsocket.onerror = function() {
//     var sipshuzu = {type:"sippanduan",message:"用户请安装sip终端"}
//     ws.send(JSON.stringify(sipshuzu))
//   };
//   //连接成功建立的回调方法
//   sipwebsocket.onopen = function(event) {
//     console.log('sip终端已连接')
//   }

//   //接收到消息的回调方法
//   sipwebsocket.onmessage = function(event) {
//     const message = JSON.parse(event.data);
//   }

//   //连接关闭的回调方法
//   sipwebsocket.onclose = function() {
  
//   }

//   //监听窗口关闭事件，当窗口关闭时，主动去关闭sipwebsocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
//   window.onbeforeunload = function() {
//     closeWebSocket();
//   }
//   //关闭连接
//   function closeWebSocket() {
//     sipwebsocket.close();
//   }
//   //清空盒子客户创建的对象和发送的不断点函数
// }



  //将消息显示在网页上
  function setMessageInnerHTML(innerHTML) {
    //let oldHtml = document.getElementById('message').innerHTML;
    document.getElementById('message').innerHTML = innerHTML + '<br/>';
  }


  //呼叫
  function call() {
    // console.log(websocket);
    if (callState != CMD_REPORT_CALL_HANGUP) {
      alert('请确认已挂机！')
    } else {
	  let phone = document.getElementById("text1").value;
      const message = {};
      message.type = CLIENT_SET_CALL_OUTGOING;
      message.called = phone;
      console.log(message);
      websocket.send(JSON.stringify(message));
    }
  }

  //拨分机号
  function sendDtmf() {
  let dtmf = document.getElementById('text2').value;
  if(dtmf!==''){
    const message = {};
    message.type = CLIENT_SET_CALL_DTMF;
    message.dtmf = dtmf;
    console.log(message);
    websocket.send(JSON.stringify(message));
	 document.getElementById('text2').value = '';
  }
  }
   
  //获取信号值
  function getSignals() {
    const message = {};
    message.type = CLIENT_GET_SIM_SINGAL;
    websocket.send(JSON.stringify(message));
  }

  function sendHeartbeat() {
    const message = {};
    message.type = CLIENT_SEND_HEARTBEAT;
    websocket.send(JSON.stringify(message));
  }

  //设置通信模块
  function currentModule() {
    let moduleId = $('#moduleSelect option:selected').val();
    const message = {};
    message.type = CLIENT_SET_CURRENT_MODULE;
    message.moduleId = parseInt(moduleId);
    console.log(message);
    websocket.send(JSON.stringify(message));
  }

  //挂断、拒接
  function hangUp() {
      console.log('挂断！')
    const message = {};
    message.type = CLIENT_SET_CALL_HANGUP;
    websocket.send(JSON.stringify(message));
  }

  //接听
  function answer() {
      console.log('接听')
    const message = {};
    message.type = CLIENT_SET_CALL_ANSWER;
    websocket.send(JSON.stringify(message));
  }

  //开始录音
  function startRecord(file) {
    const message = {};
    message.type = CLIENT_SET_RECORD_START;
    message.file = file;
    websocket.send(JSON.stringify(message));
  }
  //结束录音
  function stopRecord() {
    const message = {};
    message.type = CLIENT_SET_RECORD_END;
    // message.file = file;
    websocket.send(JSON.stringify(message));
  }

  function aliUploadFile(uploadUrl, file) {
    const message = {};
    message.type = CLIENT_SET_RECORD_UPLOAD;
    message.file = file;
    message.uploadUrl = uploadUrl;
    websocket.send(JSON.stringify(message));
  }

  //发送消息
  function send() {
    var message = document.getElementById('text1').value;
    websocket.send(message);
  }

  function handleCallRecord(message) {
    callState = CMD_REPORT_CALL_HANGUP;
    let num = null;
    console.log(message.callDirection + "------" + CALL_DIRECTION_OUTGOING);
    if (message.callDirection === CALL_DIRECTION_OUTGOING) {
			num = "拨出:" + message.called;
    } else {
	  num = "来电:"+message.caller;
    }
    //通话开始时间
		let startTime =","+message.startTime;
		startTime=startTime.substring(0,11);
     let pickUpTime = "";
    //通话结束时间
		let endTime =","+message.endTime;
		//console.log(endTime)
		endTime=endTime.substring(0,17);
    let callResult = "";
    let chat = "";
    if (message.callResult === CALL_DIS_CONNECTED) {
      callResult = ",对方未振铃";
    } else if (message.callResult === CALL_DISANSWERED) {
      callResult = ",对方未接听";
    } else if (message.callResult === CALL_ANSWERED) {
      callResult = ",接通";
      chat = ",通话时长(秒) : " + message.chat;
      pickUpTime = ",接听时间 : " + message.pickUpTime;
      stopRecord();
    //   if (isLogin()) {
    //     uploadRecord();
    //   }
    } else if (message.callResult === CALL_MISSANSWERED) {
      callResult = ",未接来电";
    }	
	// setRecordInnerHTML(num + startTime + endTime + callResult + pickUpTime + chat);
	saveCdr(num + startTime + endTime + callResult + pickUpTime + chat);
    if(isOffLine){
      saveOffLineCdr(message);
    }else{
      uploadCdr(message);
    }
	setMessageInnerHTML("通话结束");	
  }


  const JtymTow = document.getElementById('jtymTow');
  const JtymOne = document.getElementById('jtymOne');

  const {screen} = require('electron')
  const size = screen.getPrimaryDisplay().size
  const pingmuWidth = `${size.width}`
  const pingmuheight = `${size.height}`

  const ipcRenderer = require('electron').ipcRenderer
  $('.xian').click(function(){
    ipcRenderer.send('zuixiao-hua','最小化')
  })
          ipcRenderer.on('xinchuangkou-xuanRan',(event,receiveinput,output)=>{
          ipcRenderer.send('ziji-zhujincheng','')
          const receiveinputs = `${receiveinput}`
          const outputNum = `${output}`
    if(outputNum ===(receiveinputs+'点击了挂断')){
      JtymTow.style.display = 'none'
      hangUp()
    }else{
      answer()
      JtymTow.style.display = 'none'
      JtymOne.style.display = 'block' 
    }
})



function handleCallState(message) { 
    var theActive = $('.bohao.dianhua')
    if (message.state ===  SERVER_CALL_OUTGOING) {
      setMessageInnerHTML('正在呼叫...');
      theActive.text(message.called)
      phone = message.called;
      callState = CMD_REPORT_CALL_OUTGOING;
	} else if (message.state === SERVER_CALL_RINGBACK) {
      setMessageInnerHTML('振铃...');
      theActive.text(message.called)
      callState = CMD_REPORT_CALL_RINGBACK;
    } else if (message.state === SERVER_CALL_INCOMING) {
        JtymTow.style.display = 'block';
        JtymOne.style.display = 'none';
        document.getElementById('laiDian').innerHTML =(message.caller);


        
        //来电就向主进程发送消息

        const ipcRenderer = require('electron').ipcRenderer
        //每次来电话发送一次同步消息给主进程
        
        var wochao = ipcRenderer.sendSync("laidian-le",'')
        // console.log(wochao)

        //主进程判断完窗口没有聚焦时发送过来的消息
        let win = null
         if(wochao==='win-no-focused'){
          const {BrowserWindow} = require('electron').remote
          const path = require('path')
          const windowID = BrowserWindow.fromId(1).id
          var ico = path.join(__dirname, 'img', 'ico.png');
          // console.log(win)
          const invisPath =`file://${path.join(__dirname,'laidianphone.html')}`
              win = new BrowserWindow({
              width:300,
              height:300,
              resizable:false, frame: false,transparent: true,
              x:pingmuWidth-300,y:pingmuheight-300,
              webPreferences: {
                nodeIntegration: true //完全支持node
              },
              useContentSize:true, //窗口为web页面大小不包含边框
              icon: ico,
            })  

          win.loadURL(invisPath)
          win.isAlwaysOnTop()
            
          win.webContents.on('did-finish-load',function(){
            const input = message.caller
            win.webContents.send('xuanRan-xinchuangkou',input,windowID)
          })
        }else{
          console.log(wochao)
        }
        
          
          //当接收到了第二个页面发送过来的消息时，就像主进程发送消息


       phone = message.caller;
      callState = CMD_REPORT_CALL_INCOMING;
    } else if (message.state === SERVER_CALL_CONNECTED) {
      JtymTow.style.display = 'none';
	    JtymOne.style.display = 'block';
          setMessageInnerHTML('已接听，通话中...');
          theActive.text(message.caller)
      callState = CMD_REPORT_CALL_CONNECTED;
      if (phone) {
        recordFile = phone + "_" + moment().format('YYYYMMDDHHmmssYYYYMMDDHHmmss') + ".wav";
        startRecord(recordFile);
      }
    } else if (message.state === SERVER_CALL_HANGUP) {
      setMessageInnerHTML("已挂机");
      // theActive.text('已挂机')
	    console.log("已挂机")
      callState = CMD_REPORT_CALL_HANGUP;
    }
  }


  function saveCdr(cdr) {
    let cdrList = null;
    if (localStorage.getItem("cdrList")){
	  cdrList = localStorage.getItem("cdrList").split("|-|");
    } else {
      cdrList = [];
    }
    cdrList.unshift(cdr);
    if (cdrList.length > 500) {
      cdrList.pop();
    }
    //console.log(cdrList);
    localStorage.setItem("cdrList", cdrList.join("|-|"))
  }

  function loadCdrList() {
    if (localStorage.getItem("cdrList")) {
	  let cdrList = localStorage.getItem("cdrList").split("|-|");
	  document.getElementById('telListBox').innerHTML=' ';
    document.getElementById('telListBoxweijie').innerHTML = ''
    for (cdr in cdrList) {
    let arraThis = cdrList[cdr].split(',');
    
    if(arraThis[3] === "未接来电"){
      var nophone = '<div class="lastBOx"><div class="companyTime"><div class="company">'+"什么公司"+'</div><div class="time">'+arraThis[2]+'</div></div><div class="playNumber red"><div class="play">'+arraThis[0]+'</div><div class="number dontAnswer"></div></div><div class="haode">'+"回拨"+'</div></div>';
      document.getElementById('telListBoxweijie').innerHTML +=nophone
      document.getElementById('telListBox').innerHTML += nophone;
    }else{
        document.getElementById('telListBox').innerHTML +='<div class="lastBOx"><div class="companyTime"><div class="company">'+"什么公司"+'</div><div class="time">'+arraThis[2]+'</div></div><div class="playNumber"><div class="play">'+arraThis[0]+'</div><div class="number setAside"></div></div></div>';
    }

      }
    }
  }
	
  /*
    ano： 310223 ,//  com_user.CALL_NUM
    bno: 15800597248 ,//对方号码
    dn: 17051037248, //自己的号码
    direction: 0 ,//0呼入；1呼出
    recFile: isCallOk: 0, //0失败；1成功
    */
  function uploadCdr(cdr) {
    let bno = null
    let fileDate = null;
    let isCallOk = CALL_NG;
    let recFile = null;
    let routedTime = "";
    if (cdr.callDirection === CALL_DIRECTION_OUTGOING) {
      bno = cdr.called;
    } else {
      bno = cdr.caller;
    }
    if (cdr.pickUpTime && cdr.pickUpTime.length > 0) {
      fileDate = moment(cdr.pickUpTime).format('YYYYMMDDHHmmssYYYYMMDDHHmmssYYYYMMDDHHmmss');	  
      isCallOk = CALL_OK;
      recFile = "https://qijiee.oss-cn-shenzhen.aliyuncs.com/zipeibox/" + ano + "/" + recordFile;
      routedTime = fileDate;
    }
    $.ajax({
      type: "POST",
      url: "http://cdr.qijiee.com:40010/cdr/single",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        ano: ano,
        bno: bno,
        dn: dn,
        begTime: moment(cdr.startTime).format('YYYYMMDDHHmmss'),
        endTime: moment(cdr.endTime).format('YYYYMMDDHHmmss'),
        fileDate: moment(cdr.startTime).format('YYYYMMDDHHmmss'),
        routedTime: routedTime,
        direction: cdr.callDirection,
        duration: cdr.chat,
        recDuration: cdr.chat,
        recFile: recFile,
        isCallOk: isCallOk,
        seqID: 11100,
        callID: 11100,
        agentID: -1,
        forceOnhook: 0,
        devType: 0,
        isAgent: 0,
        isTrunk: 0,
        holdDuration: 0,
        holdCount: 0,
        isTransOut: 0,
        isAcdIn: 0,
        isRouteIVR: 0,
        isOverToIVR: 0,
        isRouteAcd: 0,
        isRouteAgent: 0,
        srcCallID: 0,
        callingCallID: 0,
        isSubSheet: 0,
        isConf: 0
      }),
      dataType: "json",
      success: function(result) {
        console.log("上传成功");
      },
      error: function(message) {
        console.log("上传失败");
      }
    });
  }



//   function isLogin() {
//     console.log(localStorage.getItem("loginName"));
//     console.log(localStorage.getItem("loginTime"));

//     if (localStorage.getItem("callNum")) {
//       ano = localStorage.getItem("callNum");
//     }
//     if (localStorage.getItem("userUuid")) {
//       dn = localStorage.getItem("userUuid");
//     }
//     if (localStorage.getItem("loginName") && localStorage.getItem("loginTime")) {
//       return true;
//     } else {
//       return false;
//     }
//   }

  function displaySignals(signals) {

    if(signals[0] <= 0){
      // 先判断浏览器是否打开
      if(hezidingshi){
        $(".qudong").text('检查盒子和电话卡').show()
      }
      var xhshuzu = {type:"lianjianhezi",message:"检查盒子和电话卡!"}
      ws.send(JSON.stringify(xhshuzu))
    }else{
      var chenggong = {type:"lianjieyes",message:"可以打电话了!"}
      ws.send(JSON.stringify(chenggong))
      $(".qudong").text('').hide()
    }

    $('#signalboxDiv1 b').css('background-color', '#808184');
    if (5 <= signals[0] && signals[0] < 10) {
      $('#signalboxDiv1 b:lt(1)').css('background', '#4196b7');
    } else if (10 <= signals[0] && signals[0] < 15) {
      $('#signalboxDiv1 b:lt(2)').css('background', '#4196b7');
    } else if (15 <= signals[0] && signals[0] < 20) {
      $('#signalboxDiv1 b:lt(3)').css('background', '#4196b7');
    } else if (20 <= signals[0] && signals[0] < 25) {
      $('#signalboxDiv1 b:lt(4)').css('background', '#4196b7');
    } else if (25 <= signals[0] && signals[0] < 30) {
      $('#signalboxDiv1 b:lt(5)').css('background', '#4196b7');
    } else if (30 <= signals[0]) {
      $('#signalboxDiv1 b').css('background', '#4196b7');
    }

    $('#signalboxDiv2 li').css('background-color', 'rgba(0,0,0,.5)');
    if (5 <= signals[1] && signals[1] < 10) {
      $('#signalboxDiv2 ul li:lt(1)').css('background', 'limegreen');
    } else if (10 <= signals[1] && signals[1] < 15) {
      $('#signalboxDiv2 ul li:lt(2)').css('background', 'limegreen');
    } else if (15 <= signals[1] && signals[1] < 20) {
      $('#signalboxDiv2 ul li:lt(3)').css('background', 'limegreen');
    } else if (20 <= signals[1] && signals[1] < 25) {
      $('#signalboxDiv2 ul li:lt(4)').css('background', 'limegreen');
    } else if (25 <= signals[1] && signals[1] < 30) {
      $('#signalboxDiv2 ul li:lt(5)').css('background', 'limegreen');
    } else if (30 <=  signals[1] ){
      $('#signalboxDiv2 ul li').css('background', 'limegreen');
    }
  }

  function getFileList() {
	const message = {};
    message.type = CLIENT_GET_FILE_LIST;
    websocket.send(JSON.stringify(message));
  }

  function checkDeleteFile(files) {
   //console.log(files);
	const message = {};
	let deleteFiles=[]
	let checkTime = moment().add(-1, 'days').format('YYYYMMDDHHmmss');
	
	//console.log("checkTime = "+checkTime);
	if(files&&files.length >0){
		for(let i =0;i<files.length;i++){
			let index1=files[i].lastIndexOf(".");
			let index2=files[i].length;
			let suffix=files[i].substring(index1+1,index2);//后缀名
			let fileName=files[i].substring(0,index1);
			if(suffix == "wav"){
				index1=fileName.lastIndexOf("_");
				index2=fileName.length;
				let recordTime=fileName.substring(index1+1,index2);//获取录音文件时间
				//console.log("file = "+files[i]+" ,recordTime = "+recordTime);
				if(checkTime>recordTime){
					deleteFiles.push(files[i]);
				}
			}
		}
	}
	if(deleteFiles&&deleteFiles.length >0){
		for(let i = 0;i <deleteFiles.length;i++){
			 message.type = CLIENT_SET_RECORD_DELETE;
			 message.file=deleteFiles[i];
			 console.log("delete file = "+message.file);
			 websocket.send(JSON.stringify(message));
		}
	}
  }

  //function checkDisplay() {
    // if (isLogin()) {
    //   $('#loginDiv').hide();
    //   $('#userDiv').show();
    //   displayUserinfo();
    // } else {
    //   $('#loginDiv').show();
    //   $('#userDiv').hide();
    // }
  //}

//   function logout() {
//     localStorage.clear();
//     checkDisplay();
//     ano = null;
//   }

//   function login() {
//     var loginName = $('#loginNameInput').val();
//     var password = $('#passwordInput').val();
// 	var date = new Date();
//     if (loginName != null && loginName.length > 0 && password != null && loginName.length > 0) {

//       $.ajax({
//         type: "POST",
//         url: "http://cdr.qijiee.com:40010/users/login",
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify({
//           loginName: loginName,
//           password: password
//         }),
//         dataType: "json",
//         success: function(result) {
//           if (result.status === "ok") {
//             localStorage.setItem("loginName", result.loginName);
//             localStorage.setItem("loginTime", formatDate(date));
//             localStorage.setItem("userUuid", result.userUuid);
//             localStorage.setItem("comUuid", result.comUuid);
//             localStorage.setItem("userName", result.userName);
//             localStorage.setItem("callNum", result.callNum);
//             ano = result.callNum;
//             dn = result.userUuid;
//             checkDisplay();
//           } else {
//             alert("用户名密码错误");
//           }
//         },
//         error: function(message) {
// 			console.log(message);
//           alert("登录失败");
//         }
//       });
//     } else {
//       alert("用户名、密码不能为空");

//     }
//   }

//   function displayUserinfo() {
//     document.getElementById('loginNameLabel').innerHTML = localStorage.getItem("loginName");
//     document.getElementById('loginTimeLabel').innerHTML = localStorage.getItem("loginTime");
//   }
  
//   function formatDate(date) {
//     var myyear = date.getFullYear();
//     var mymonth = date.getMonth() + 1;
//     var myweekday = date.getDate();
 
//     if (mymonth < 10) {
//         mymonth = "0" + mymonth;
//     }
//     if (myweekday < 10) {
//         myweekday = "0" + myweekday;
//     }
//     return (myyear + "年" + mymonth + "月" + myweekday + "日");
// }


//   function uploadRecord() {

//     $.ajax({
//       url: "http://139.199.6.147:3100/oss",
//       type: 'GET',
//       data: {
//         "devideNum": localStorage.getItem("callNum"),
//         "softVersion": "fee"
//       },
//       success: function(data) {
//         console.log("oss url = " + data);

//         aliUploadFile(data, recordFile);
        // ali_uploadFile(data, function(fileName) {
        //   console.log("fileName = " + fileName);
        // });
        //
        // var fileName = vFilePath.replace("c:\\", "");
        // if (fileName && fileName.length > 15) {
        //   aliFilePath = "https://qijiee.oss-cn-shenzhen.aliyuncs.com/zipeibox/" + devideNum + "/" + fileName;
        // }

//       }
//     });
//   }

  //更新通讯页面,发送不断点的信号值
  // $(document).ready(function() {
  //   // checkDisplay();
  //   loadCdrList();
  //   setInterval('getSignals()', 5000);
  // });
  
  function yingliangpan(box,bar,all){
    // var box = document.getElementsByClassName('box')[0]
    // var bar = document.getElementsByClassName('bar')[0]
    // var all = document.getElementsByClassName('allyingliang')[0]
    // var p = document.getElementsByTagName('p')[0];
    var cha = bar.offsetHeight - box.offsetHeight
    box.onmousedown = function (ev) {
    let boxL = box.offsetTop
    let e = ev || window.event 
    let mouseY = e.clientY
    window.onmousemove = function (ev) {
      
    let e = ev || window.event
    let moveL = e.clientY - mouseY 
    let newL = boxL + moveL 
    
    if (newL < 0) {
    newL = 0
    }
    if (newL >= cha) {
    newL = cha
    }
    
    box.style.top = newL + 'px'
    
    let bili = (140-newL) / cha * 100
    // p.innerHTML = '当前位置' + Math.ceil(bili) + '%'
    return false //取消默认事件
    }
    window.onmouseup = function () {
    window.onmousemove = false //解绑移动事件
    return false
    }
    return false
    };
    // 点击音量条
    bar.onclick = function (ev) {
    let top = ev.clientY - (all.offsetTop+66)- box.offsetHeight / 2
    
    if (top < 0 ) {
      top = 0;
  
      }
    if (top >= cha) {
      top = cha;
     
      }
    box.style.top = top + 'px'
    let bili = (140-top) / cha * 100
    // p.innerHTML = '当前位置' + Math.ceil(bili) + '%'
    return false
    }
  }
  //打开默认浏览器进入https://crm.aimengyx.com/login
  const shell = require('electron').shell;
  const links = document.querySelectorAll('a[href]')
  Array.prototype.forEach.call(links, function (link) {
    const url = link.getAttribute('href')
    if (url.indexOf('http') === 0) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        shell.openExternal(url)
      })
    }
  })

   

$(document).ready(function () {  
  //禁用页面
  $('.shiyi').addClass("notclickn")
   //拨号
    $('.call-but').click(function(){
    var textval = $('#text1').val();
        if(textval !==''){
            $('.jtym').show();
            $('.dianhua').text(textval)
            //呼叫
            call()
        }
    })
    // 拨分机
    $('.fenhao').click(function(){
        $('#baoHaoPan2').show();
        $('.yingchang').show();
        $('.bhzhuangtai').hide();
        $('#text2').focus();
        var timer
        $(document).keydown(function(event){
          // console.log(event.keyCode)
        if(event.keyCode ===13){
            // document.getElementById('text2').onkeyup = function(){
                clearTimeout(timer); 
                timer=setTimeout(sendDtmf,3000)
          //  }
        }
       })
    })
 
    //拨分机隐藏
    $('.yingchang').click(function(){
        $('#baoHaoPan2').hide();
        $('.yingchang').hide();
        $('.bhzhuangtai').show();
        $('#text2').val('')
    })
    //拨号界面挂断
    $('.quxiao').click(function(){
        $('.bhzhuangtai').show();
        $('#baoHaoPan2').hide();
        $('.jtym').hide();
        $('.ldym').hide();
        $('.yingchang').hide();
        $('#text1').val('').focus();
        $('#text2').val('');
        //挂断
        hangUp();
    })
    //拨号界面音量
    $('.mianti').click(function(){
      $('.allyingliang').toggle()
      var box = document.getElementsByClassName('box')[0]
      var bar = document.getElementsByClassName('bar')[0]
      var all = document.getElementsByClassName('allyingliang')[0]
      yingliangpan(box,bar,all);
    })
    $('.luying').click(function(){
      $('.allyingliangtow').toggle();
      var box = document.getElementsByClassName('box')[1]
      var bar = document.getElementsByClassName('bar')[1]
      var all = document.getElementsByClassName('allyingliangtow')[0]
      yingliangpan(box,bar,all)
    })
    //来电界面接听
    $('.answerThePhone').click(function(){
        $('.jtym').show();
        $('.ldym').hide();
        //接听
        answer()
    })
    //来电页面挂断
    $('.hangUpThePhone').click(function(){
        $('.ldym').hide();
        //挂断
        hangUp();
    })
    //储存电话页面
    $('.suoyou').click(function(){
        $(this).addClass('beijing');
        $('.weijie').removeClass('beijing')
        $('.callRecords.one').show();
        $('.callRecords.tow').hide();
    })
    $('.weijie').click(function(){
        $(this).addClass('beijing');
        $('.suoyou').removeClass('beijing')
        $('.callRecords.one').hide();
        $('.callRecords.tow').show();
    })
    //回拨键
    $('.telListBox').on('mouseover','.lastBOx',function(){
        $(this).children('.haode').addClass('huibo')
    })
    $('.telListBox').on('mouseout','.lastBOx',function(){
        $(this).children('.haode').removeClass('huibo') 
    })
      //回拨号码
      $('.telListBox').on('click','.haode',function(){
       var huibohaoma = $(this).prev().children(":first").text()
       var haoma =  huibohaoma.replace(/[^0-9]/ig,"");
         $('#jtymOne').show();
         $('.bohao.dianhua').text(haoma)
        if (callState != CMD_REPORT_CALL_HANGUP) {
             alert('请确认已挂机！')
        } else {
             let phone = haoma;
            const message = {};
            message.type = CLIENT_SET_CALL_OUTGOING;
             message.called = phone;
            console.log(message);
             websocket.send(JSON.stringify(message));
         }
    })

    // $('#text1').focus();
    $('.tab.phone').click(function(){
        $('#text1').focus();
    })
    //判断#text1是否聚焦，聚焦就显示按钮，
   $('#text1').focus(function(){
    $('.delete-btn').css('display','block')
  })

    var tabContents = $('.phone-tab-contents');
    $('.phone-tabs .getphone').click(function () {
        tabContents.removeClass('getclock');
        $('.getphone').removeClass('getphoneGray');
        $('.getphone').addClass('getphoneBlue');
        $('.getclock').removeClass('getclockBlue');
        $('.getclock').addClass('getclockGray');
        $('#text1').focus();
    })
    $('.phone-tabs .getclock').click(function () {
        tabContents.addClass('getclock');
        $('.getphone').removeClass('getphoneBlue');
        $('.getphone').addClass('getphoneGray');
        $('.getclock').removeClass('getclockGray');
        $('.getclock').addClass('getclockBlue');
        loadCdrList();
    })
    var Text2= null
    /* Delete */
    $('#btn').click(function() {
      var numbers = $(' #text1').val();
      var numbers2 = $(' #text1').val().length;
      $(' #text1').val(numbers.substr(0, numbers2 - 1));
    });
    var pusher = {
        number: function (num) {
            $('#shuZi' + num + '').click(function () {
                var Text = $('#text1').val();
                $("#text1").val(Text + num);
            });
            $('#jp' + num + '').click(function() {
                $('#text2').focus();
                Text2 =$('#text2').val();
                if (Text2 == '') {
                setTimeout(sendDtmf, 3000);
                }
                $(' #text2').val(Text2 + num);
            });
        }
    }
    pusher.number(1);
    pusher.number(2);
    pusher.number(3);
    pusher.number(4);
    pusher.number(5);
    pusher.number(6);
    pusher.number(7);
    pusher.number(8);
    pusher.number(9);
    pusher.number(0);

    $('#xingHao').click(function() {
        var Text = $('#text1').val();	
        $(' #text1').val(Text + '*');
        });
    $('#jingHao').click(function() {
        var Text = $('#text1').val();	
        $(' #text1').val(Text + '#');
        });

        $('#nianqing').click(function() {
         Text2 = $('#text2').val();
            $('#text2').focus();    
            if (Text2 == '') {
            	 setTimeout(sendDtmf, 3000);
            	}
                $('#text2').val(Text2 + '*');
            });
        $('#nianlao').click(function() {
         Text2 = $('#text2').val();             
            $('#text2').focus();
            	if (Text2 == '') {
            	setTimeout(sendDtmf, 3000);
            	}
         
            $('#text2').val(Text2 + '#');
        });
})
