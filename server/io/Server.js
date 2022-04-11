
// Colyseus + Express
const colyseus = require("colyseus");
const { ChatRoom } = require('./ChatRoom.js')
// import {ChatRoom} from './ChatRoom.mjs'

const deltaTime = 80   // 每秒12.5次
exports.create = function (server) {

    const gameServer = new colyseus.Server({
        server,
        pingInterval: 5000,  // 多久发一次ping  3000
        pingMaxRetries: 4,   // 最多几次允许ping无反应  2
        verifyClient: _verif
    });

    _serverFunc(gameServer)

    return gameServer
}


async function _verif(info, next) {
    // console.log('验证obj', info, next)

    // - next(false) will reject the websocket handshake
    // - next(true) will accept the websocket handshake
    next(true)
}



function _serverFunc(gameServer) {

    // Define "chat" room
    gameServer.define("chat", ChatRoom);  // 创建一个聊天室

    // debugger
    // gameServer.on("create", (room) => console.log("room created:", room.roomId))
    //     .on("dispose", (room) => console.log("room disposed:", room.roomId))
    //     .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    //     .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

    // simulate 200ms latency between server and client.
    gameServer.simulateLatency(200);   // 模拟200的延迟
}