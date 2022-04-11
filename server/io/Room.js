const colyseus = require("colyseus");
const { Room, Client } = colyseus

const deltaTime = 80   // 每秒12.5次
exports.Room = class extends Room {

    /*
lock ()¶
Locking the room will remove it from the pool of available rooms for new clients to connect to.

unlock ()¶
Unlocking the room returns it to the pool of available rooms for new clients to connect to.

disconnect ()¶
Disconnect all clients, then dispose.    

locked: boolean (read-only)¶  判断房间有没被锁
*/

    onCreate(options) {

        this.maxClients = 20  // 房间最大人数

        // 补偿帧
        // Set frequency the patched state should be sent 
        // to all clients. Default is 50ms (20fps)
        this.setPatchRate(1000)

        // console.log('是否有fix', this.fixUpdate)
        if (this.fixUpdate) {
            this.setSimulationInterval(this.fixUpdate.bind(this), deltaTime);
        }

        // this.clock.start();
        // Set an interval and store a reference to it so that we may clear it later
        // this.delayedInterval = this.clock.setInterval(() => {
        // console.log("Time now " + this.clock.currentTime);
        // }, deltaTime);

        // After 10 seconds clear the timeout; this will *stop and destroy* the timeout completely
        // this.clock.setTimeout(() => {
        // this.delayedInterval.clear();
        // }, 10_000);
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    async onAuth(client, options, request) {
        const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
        console.log('验证房间', client, options, request, ip)


        // return true   // 默认可以加入
        // 可以返回对象，查询出的玩家数据，在onJoin中可以收到
        return {skin:'fafasdfa'}
        // return false
    }

    // When client successfully join the room 玩家加入房间
    onJoin(client, options, auth) {
        console.log('房间加入', client, options, auth)

    }

    // When a client leaves the room
    async onLeave(client, consented) {
        console.log('房间离开', client, consented)
        // 给保存游戏进度的地方 client.sessionId 为用户id
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        console.log('删除dispose')
    }
}