
const core = require('../core/core')
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const ChatRoom = require('./ChatRoom').ChatRoom

let wss, ws
exports.Server = function (server) {
    wss = new WebSocketServer({
        server: server
    });

    const chatRoom = new ChatRoom()
    // chatRoom.broadcast = broadcast  // 弃用，用它自己的
    chatRoom.send = sendMessage

    wss.on('connection', function connection(websocket) {
        // const location = url.parse(ws.upgradeReq.url, true);
        // console.log('有人连上ws服务器', websocket)
        // you might use location.query.access_token to authenticate or share sessions
        // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
        // ws = websocket
        websocket.id = core.uuid()
        websocket.on('message', function incoming(message) {
            // console.log('received: %s', message);
            const m = receiveMessage(message)
            if (!m) return
            // broadcast(m)
            chatRoom.on(websocket, m)
        });

        // ws.send('start', { id: core.uuid() });
    });

    wss.on('close', function close(e) {
        // clearInterval(interval);
        chatRoom.onClose(e)
    });

}

function sendMessage(ws, obj) {
    if (ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify(obj))
}

function broadcast(obj) {
    wss.clients.forEach(function each(client) {
        // if (client !== ws && client.readyState === WebSocket.OPEN) {
        if (client.readyState === WebSocket.OPEN) {
            //   client.send(data);
            sendMessage(client, obj)
        }
    });
}

function receiveMessage(m) {
    // console.log('接收到信息', m)
    let msg
    try {
        msg = JSON.parse(m)
    }
    catch (e) {
        console.error('客户端信息不对', e)
        return
    }
    return msg
}

