
// tslint:disable-next-line:class-name
export class helper {
public Users:any[]=[];
    constructor() {}

    public AddUser(socketid, user) {
       this.Users.push({id: socketid,name: user.name, room: user.room});
       return this.Users;
    }

    public getUser(id) {
        let value: any;
        if(this.Users.length) {
            value = this.Users.filter((user) => user.id === id)[0];
            return value;
        }
        return value;
    }

}