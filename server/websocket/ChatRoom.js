const WebSocket = require('ws');
const Player = require('./Player').Player

const MsgTypes = Object.freeze({
    INIT: 1,
    CHAT: 2,
    PLAYERLIST: 3,
})

exports.ChatRoom = class{

    constructor(){

        // 外部传入广播和单独发送
        // this.broadcast = null
        this.send = null

        this.list = new Map()
        this.loop()
    }
    
    loop(){
        this.interval = setInterval( () => {
            // wss.clients.forEach(function each(ws) {
            //   if (ws.isAlive === false) return ws.terminate();
          
            //   ws.isAlive = false;
            //   ws.ping(noop);
            // });
            for(let [key, player] of this.list ){
                if(key.readyState === WebSocket.OPEN || key.readyState === WebSocket.CONNECTING) continue
                this._removeOne( key, player )
                
            }
        }, 5000);          
    }
    

    _removeOne(key, player){
        console.log('发现断线的，剩余在线人数', this.list.size)

        let list = []
        for( let d of this.list.values() ){  // 获取在线玩家名字
            list.push({ id: d.data.id, name: d.data.name })
        }
        // console.log('在线人数', this.list.size, this.list )
        // 广播给所有人更新列表
        this.broadcast(key, {
            type: MsgTypes.PLAYERLIST,
            list,
            leave: player.data.name
        })
    
        // this.broadcast(key, {
        //     type: MsgTypes.CHAT,
        //     msg: player.data.name + ' 离开了房间'
        // })
        player.dispose()
        key.terminate()
        this.list.delete( key )
    }


    onClose(w){
        console.log('玩家断线', w)
    }

    on(ws, msg){
        console.log("接收到客户端信息", ws.id, msg)

        // this.broadcast(msg)
        if(msg.type === MsgTypes.INIT){
            this._newPlayer(ws, msg)
        }
        else if(msg.type === MsgTypes.CHAT ){
            this._chatMsg(ws, msg)
        }
    }
    
    _chatMsg(ws, msg){
        if(!msg.msg) return
        // const player = this.list.keys().find(ws)
        this.broadcast( ws, msg )
    }

    _newPlayer(ws, msg){  // 创建一个新玩家
        const player = new Player( ws.id )  // 新建玩家
        player.data.name = msg.msg   // 记录名字
        this.list.set( ws, player )  // 存入数组
        // debugger

        let list = []
        for( let d of this.list.values() ){  // 获取在线玩家名字
            list.push({ id: d.data.id, name: d.data.name })
        }
        console.log('在线人数', this.list.size, this.list )
        // 广播给所有人更新列表
        this.broadcast(ws, {
            type: MsgTypes.PLAYERLIST,
            list,
            new: player.data.name
        })
    }

    // 广播的情况
    broadcast(ws, msg){
        for(let key of this.list.keys() ){
            // if( key.id === ws.id ) continue  // 不发送自己
            this.send( key, msg )
        }
    }
}