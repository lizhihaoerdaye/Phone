//client获取设备是否已连接
const CLIENT_GET_DEVICE_CONNECTED = 1001;
//client获取设备状态
const CLIENT_GET_DEVICE_STATE = 1002;
//client获取通话状态
const CLIENT_GET_CALL_STATE = 1003;
//client获取通话记录
const CLIENT_GET_CALL_LIST = 1004;
//client获取录音文件列表
const CLIENT_GET_FILE_LIST = 1005;
// client获取型号值
const CLIENT_GET_SIM_SINGAL = 1006;


//client拨号
const CLIENT_SET_CALL_OUTGOING = 1101;
//client接听
const CLIENT_SET_CALL_ANSWER = 1102;
//client拒接
const CLIENT_SET_CALL_HANGUP = 1103;
//client开始录音
const CLIENT_SET_RECORD_START = 1104;
//client停止录音
const CLIENT_SET_RECORD_END = 1105;
//client上传录音
const CLIENT_SET_RECORD_UPLOAD = 1106;
//client删除录音
const CLIENT_SET_RECORD_DELETE = 1107;
//client打开设备
const CLIENT_SET_DEVICE_OPEN = 1108;
//client关闭设备
const CLIENT_SET_DEVICE_CLOSE = 1109;
//client设置通信模块
const CLIENT_SET_CURRENT_MODULE = 1110;
// client发送dtmf
const CLIENT_SET_CALL_DTMF = 1111;

//client发送心跳
const CLIENT_SEND_HEARTBEAT = 1210;

//server设备状态
const SERVER_SEND_DEVICE_STATE = 2001;
//server通话状态
const SERVER_SEND_CALL_STATE = 2002;
//server通话话单
const SERVER_SEND_CALL_RECORD = 2003;
//server通话记录
const SERVER_SEND_CALL_LIST = 2004;
//server录音文件
const SERVER_SEND_FILE_LIST = 2005;

// server来电
const SERVER_CALL_INCOMING = 2006;
// server振铃
const SERVER_CALL_RINGBACK = 2007;
// server呼出
const SERVER_CALL_OUTGOING = 2008;
// server接通
const SERVER_CALL_CONNECTED = 2009;
// server挂机
const SERVER_CALL_HANGUP = 2010;
// server空闲
const SERVER_CALL_IDLE = 2011;
// server通话未被接听
const SERVER_CALL_NOT_BEEN_ANSWERED = 2012;
// server通话记录上报
const SERVER_LAST_CALL_RECORD = 2013;

// 文件上传类型
const UploadType = "uploadType";
// 上传路径
const UploadUrl = "uploadUrl";
// 消息类型
const Type = "type";
// 呼出号码
const OutgoingNumber = "called";

// 录音文件名
const RecordFileName = "file";

//设备呼出
const CMD_REPORT_CALL_OUTGOING = 41;
//呼出后，收到对方在振铃的信号
const CMD_REPORT_CALL_RINGBACK = 42;
//收到新的来电
const CMD_REPORT_CALL_INCOMING = 43;
//通话接听状态
const CMD_REPORT_CALL_CONNECTED = 44;
//结束通话状态
const CMD_REPORT_CALL_HANGUP = 45;

// 呼出
const CALL_DIRECTION_OUTGOING = 0;
// 呼入
const CALL_DIRECTION_INCOMING = 1;

// 呼出，对方未振铃，可能是空号
const CALL_DIS_CONNECTED = 0;

// 呼出，对方未接听
const CALL_DISANSWERED = 1;

//呼入/呼出， 接通
const CALL_ANSWERED = 2;

// 呼入，未接来电
const CALL_MISSANSWERED = 3;

//呼叫成功
const CALL_OK = 1;

//呼叫失败
const CALL_NG = 0;
