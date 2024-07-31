import express from 'express';
import socketIo from 'socket.io';
import moment from 'moment';
const app = express();

app.set('port', process.env.PORT || 3000);
// tslint:disable-next-line:no-var-requires
const server = require("http").createServer(app);

app.get('/socketapp', (req, res) => {
  res.json(['hi']);
});
app.get('/', (req, res) => {
  res.json(['sp']);
});
server.listen(app.get('port'), err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${app.get('port')}`);
});
let users: any[]=[];
const addUser = (socketid, user) => {
  users.push({id: socketid,name: user.name, room: user.room});
}
const getUserList = (room) => {
  // tslint:disable-next-line:no-shadowed-variable
  const user = users.filter((user) => user.room === room);
  return user;
}
const getUser = (id) => {
   let value: any;
       value = users.filter((user) => user.id === id)[0];
       return value;
}
const removeUser = (socketid) => {
  const user = getUser(socketid);
    if (user) {
      users = users.filter((us) => us.id !== socketid);
    }
  return user;
}
const io = socketIo.listen(server);

io.sockets.on('connection', socket => {

  socket.on('join_Room', value => {
    console.log('socket', socket.id);
    socket.join(value.room);
    addUser(socket.id, value);
    const user = getUser(socket.id);
    io.to(value.room).emit('userList', getUserList(value.room));
    socket.emit('messages', {
      message: `welcome to joined ${value.room}.`,
      name: 'Admin',
      date: moment().format('LT')
    });
    socket.broadcast.to(value.room).emit('messages', {
      message: `${user.name} has Joined.`,
      name: 'Admin',
      date: moment().format('LT')
    });
  });

  socket.on('sent_message', data => {
    console.log('message', data);
    const user = getUser(socket.id);
    if( user && user.room) {
      io.to(user.room).emit('messages', {
        message: data.message,
        name: user.name,
        date: moment().format('LT')
      });
    }
  });

  socket.on('disconnect', ()=>{
    const user = removeUser(socket.id);
    if (user) {
        io.to(user.room).emit('userList', getUserList(user.room));
        io.to(user.room).emit('messages', {
          message: `${user.name} has left.`,
          name: 'Admin',
          date: moment().format('LT')
        });
        console.log('disconnect', `${user.name} ${user.id} has left.`)
    }
});

});




// tslint:disable-next-line:class-name
// export class userhelper {
//   public Users: any = [];
//   public AddUser(socketid, user) {
//     this.Users.push({id: socketid,name: user.name, room: user.room});
//     return this.Users;
//   }

//   public getUser(id) {
//      let value: any;
//      if(this.Users.length) {
//          value = this.Users.filter((user) => user.id === id)[0];
//          return value;
//      }
//      return value;
//   }
// }
