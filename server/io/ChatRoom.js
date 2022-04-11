
const { Room } = require('./Room')
// import { Room, Client } from 'colyseus'
// debugger


exports.ChatRoom = class extends Room {
    constructor() {
        super()
        this.players = null
    }

    // When room is initialized 房间启动
    onCreate(options) {
        console.log('房间创建', options, this.roomId, this.clients)
        super.onCreate(options)

        
        // 给客户端搜索列表中显示的信息
        this.setMetadata({ friendlyFire: true });
        
        this.players = new Map()

        // 接收信息的方法
        this.onMessage("action", (client, message) => {
            //
            // Triggers when 'action' message is sent.
            //
            console.log('接收到信息', client, message)

            // 仅在应用状态更改后向所有客户广播消息
            this.broadcast("destroy", "something has been destroyed",
                { afterNextPatch: true });

        });

        this.onMessage("*", (client, type, message) => {
            //
            // Triggers when any other type of message is sent,
            // excluding "action", which has its own specific handler defined above.
            //
            console.log('接收所有信息', client.sessionId, "sent", type, message);
        });
    }

    onJoin(client, options, auth) {
        super.onJoin(client, options, auth)

        this.players.set(client.sessionId, { name: '新玩家' })
        // 加入信息，除了发给他自己
        this.broadcast("NEW_PLAYER", client, { except: client });
    }

    async onLeave(client, consented){
        await super.onLeave(client, consented)
                // 允许玩家断线20秒重连
        // flag client as inactive for other users
        this.players.get(client.sessionId).connected = false;

        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 20);

            // client returned! let's re-activate it.
            this.players.get(client.sessionId).connected = true;

        } catch (e) {

            // 20 seconds expired. let's remove the client.
            // delete this.players[client.sessionId];
            this.players.delete( client.sessionId )
        }
    }

    // fixUpdate(dt){   // 有无fixUpdate决定是否更新
    //     console.log('服务器更新', dt)
    // }

    onDispose() {
        super.onDispose()
        this.players.clear()
        this.players = null
    }
}


// export {ChatRoom}

