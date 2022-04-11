


exports.Player = class {
    constructor(id){
        this.data = {
            id : id,
            name: 'unnanmed'
        }
    }


    dispose(){  // 删除自己
        delete this.data
    }
}